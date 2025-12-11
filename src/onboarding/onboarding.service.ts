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

  async getStatus(userId: string): Promise<OnboardingStatusResponse> {
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
        steps = JSON.parse(user.onboardingSteps);
      } catch (error) {
        this.logger.error('Erro ao parsear onboardingSteps:', error);
      }
    }

    return {
      completed: user.onboardingCompleted,
      steps,
      totalPoints: user.pontos,
    };
  }

  async completeStep(
    userId: string,
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
        steps = JSON.parse(user.onboardingSteps);
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

    // Atualiza no banco
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingSteps: JSON.stringify(steps),
        onboardingCompleted: allCompleted,
        pontos: {
          increment: pointsToAdd + completionBonus,
        },
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

  async checkAndCompleteProfilePic(userId: string): Promise<void> {
    // Verifica se o usuário tem foto de perfil
    const profilePic = await this.prisma.profilePic.findUnique({
      where: { userId },
    });

    if (profilePic) {
      await this.completeStep(userId, 'profilePic');
    }
  }

  async checkAndCompleteBio(userId: string): Promise<void> {
    // Verifica se o usuário tem biografia
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { biografia: true },
    });

    if (user?.biografia && user.biografia.trim().length > 0) {
      await this.completeStep(userId, 'bio');
    }
  }

  async checkAndCompleteFirstChallenge(userId: string): Promise<void> {
    // Verifica se o usuário tem desafios concluídos
    const desafiosConcluidos = await this.prisma.desafiosConcluidos.count({
      where: { userId },
    });

    if (desafiosConcluidos > 0) {
      await this.completeStep(userId, 'firstChallenge');
    }
  }
}
