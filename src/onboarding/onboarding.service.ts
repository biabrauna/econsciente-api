import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

export interface OnboardingSteps {
  profilePic: boolean;
  bio: boolean;
  firstChallenge: boolean;
}

export interface OnboardingStatusResponse {
  completed: boolean;
  steps: OnboardingSteps;
  totalPoints: number;
  shouldShow: boolean;
  skippedAt?: Date;
}

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  // Pontos por etapa
  private readonly POINTS = {
    profilePic: 100,
    bio: 50,
    firstChallenge: 200,
    completion: 50, // Bônus por completar tudo
  };

  constructor(
    private prisma: PrismaService,
    private notificacoesService: NotificacoesService,
  ) {}

  async getStatus(userId: number): Promise<OnboardingStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let steps: OnboardingSteps = {
      profilePic: false,
      bio: false,
      firstChallenge: false,
    };

    if (user.onboardingSteps) {
      try {
        steps = JSON.parse(user.onboardingSteps as string);
      } catch (error) {
        this.logger.error('Erro ao parsear onboardingSteps:', error);
      }
    }

    // Determina se deve mostrar o onboarding
    let shouldShow = !user.onboardingCompleted;

    // Se foi pulado, verifica se já passou tempo suficiente para mostrar novamente
    if (user.onboardingSkippedAt && !user.onboardingCompleted) {
      const now = new Date();
      const skippedAt = new Date(user.onboardingSkippedAt);
      const hoursSinceSkipped = (now.getTime() - skippedAt.getTime()) / (1000 * 60 * 60);

      // Só mostra novamente após 24 horas ou no próximo login (nova sessão)
      shouldShow = hoursSinceSkipped >= 24;
    }

    return {
      completed: user.onboardingCompleted,
      steps,
      totalPoints: Number(user.pontos),
      shouldShow,
      skippedAt: user.onboardingSkippedAt || undefined,
    };
  }

  async completeStep(
    userId: number,
    step: 'profilePic' | 'bio' | 'firstChallenge',
  ): Promise<OnboardingStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se já completou o onboarding, não faz nada
    if (user.onboardingCompleted) {
      return this.getStatus(userId);
    }

    let steps: OnboardingSteps = {
      profilePic: false,
      bio: false,
      firstChallenge: false,
    };

    if (user.onboardingSteps) {
      try {
        steps = JSON.parse(user.onboardingSteps as string);
      } catch (error) {
        this.logger.error('Erro ao parsear onboardingSteps:', error);
      }
    }

    // Se a etapa já foi completada, não adiciona pontos novamente
    if (steps[step]) {
      return this.getStatus(userId);
    }

    // Marca a etapa como completada
    steps[step] = true;
    const pointsToAdd = this.POINTS[step];

    // Verifica se todas as etapas foram completadas
    const allCompleted = steps.profilePic && steps.bio && steps.firstChallenge;
    const completionBonus = allCompleted ? this.POINTS.completion : 0;

    // Buscar dados atuais do usuário para calcular XP/nível
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, nivel: true },
    });

    if (!currentUser) {
      this.logger.error(`Usuário ${userId} não encontrado ao completar etapa`);
      return this.getStatus(userId);
    }

    // Converter pontos em XP (1 ponto = 10 XP)
    const totalPontos = pointsToAdd + completionBonus;
    const xpGanho = totalPontos * 10;
    const { NivelHelper } = await import('../users/helpers/nivel.helper');
    const { novoXp, novoNivel } = NivelHelper.adicionarXp(
      Number(currentUser.xp),
      Number(currentUser.nivel),
      xpGanho,
    );

    // Atualiza no banco
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingSteps: JSON.stringify(steps),
        onboardingCompleted: allCompleted,
        pontos: {
          increment: totalPontos,
        },
        xp: novoXp,
        nivel: novoNivel,
      },
    });

    // Cria notificação
    const stepNames = {
      profilePic: 'Foto de Perfil',
      bio: 'Biografia',
      firstChallenge: 'Primeiro Desafio',
    };

    await this.notificacoesService.create({
      userId,
      tipo: 'onboarding',
      titulo: `🎉 Etapa Concluída: ${stepNames[step]}`,
      mensagem: `Parabéns! Você ganhou +${pointsToAdd} pontos!${completionBonus > 0 ? ` E mais +${completionBonus} pontos bônus por completar o onboarding! 🚀` : ''}`,
      metadata: JSON.stringify({ step, points: pointsToAdd + completionBonus }),
    });

    this.logger.log(
      `Usuário ${userId} completou etapa ${step} (+${pointsToAdd + completionBonus} pontos)`,
    );

    return this.getStatus(userId);
  }

  async checkAndCompleteProfilePic(userId: number): Promise<void> {
    // Verifica se o usuário tem foto de perfil
    const profilePic = await this.prisma.profilePic.findUnique({
      where: { userId },
    });

    if (profilePic) {
      await this.completeStep(userId, 'profilePic');
    }
  }

  async checkAndCompleteBio(userId: number): Promise<void> {
    // Verifica se o usuário tem biografia
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { biografia: true },
    });

    if (user?.biografia && user.biografia.trim().length > 0) {
      await this.completeStep(userId, 'bio');
    }
  }

  async checkAndCompleteFirstChallenge(userId: number): Promise<void> {
    // Verifica se o usuário tem desafios concluídos
    const desafiosConcluidos = await this.prisma.desafiosSubmetidos.count({
      where: { userId, status: 'SUCCESS' },
    });

    if (desafiosConcluidos > 0) {
      await this.completeStep(userId, 'firstChallenge');
    }
  }

  async skipOnboarding(userId: number): Promise<OnboardingStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se já completou, não precisa pular
    if (user.onboardingCompleted) {
      return this.getStatus(userId);
    }

    // Marca como pulado agora
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingSkippedAt: new Date(),
      },
    });

    this.logger.log(`Usuário ${userId} pulou o onboarding`);

    return this.getStatus(userId);
  }
}
