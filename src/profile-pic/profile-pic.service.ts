import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilePicWithUserDto } from './dto/create-profile-pic.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class ProfilePicService {
  private readonly logger = new Logger(ProfilePicService.name);

  constructor(
    private prisma: PrismaService,
    private conquistasService: ConquistasService,
    private notificacoesService: NotificacoesService,
    @Inject(forwardRef(() => OnboardingService))
    private onboardingService: OnboardingService,
  ) {}

  async create(createProfilePicDto: CreateProfilePicWithUserDto) {
    // Cria/atualiza a foto de perfil e adiciona 5 pontos
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Deleta foto antiga se existir (constraint unique no userId)
      await tx.profilePic.deleteMany({
        where: { userId: createProfilePicDto.userId },
      });

      // Cria a nova foto
      const profilePic = await tx.profilePic.create({
        data: {
          userId: createProfilePicDto.userId,
          name: createProfilePicDto.name || 'profile-picture',
          url: createProfilePicDto.url,
        }
      });

      // Buscar dados atuais do usuário para calcular XP/nível
      const currentUser = await tx.user.findUnique({
        where: { id: createProfilePicDto.userId },
        select: { xp: true, nivel: true },
      });

      // Converter pontos em XP (1 ponto = 10 XP)
      const pontosGanhos = 5;
      const xpGanho = pontosGanhos * 10;
      const { NivelHelper } = await import('../users/helpers/nivel.helper');
      const { novoXp, novoNivel, subiuNivel } = NivelHelper.adicionarXp(
        Number(currentUser.xp),
        Number(currentUser.nivel),
        xpGanho,
      );

      // Adiciona 5 pontos por upload de foto e atualiza XP/nível
      await tx.user.update({
        where: { id: createProfilePicDto.userId },
        data: {
          pontos: {
            increment: pontosGanhos,
          },
          xp: novoXp,
          nivel: novoNivel,
        },
      });

      return { profilePic, nivelAnterior: currentUser.nivel, novoNivel, subiuNivel };
    });

    // Verifica conquista de primeira foto (async)
    this.conquistasService.checkAndUnlock(
      createProfilePicDto.userId,
      'upload_profile_pic'
    ).then(async (conquistasDesbloqueadas) => {
      for (const conquistaNome of conquistasDesbloqueadas) {
        const conquista = await this.prisma.conquista.findUnique({
          where: { nome: conquistaNome },
        });
        if (conquista) {
          await this.notificacoesService.notifyConquista(
            createProfilePicDto.userId,
            conquistaNome,
            conquista.id
          );
        }
      }
    }).catch(err => {
      this.logger.error(`Erro ao verificar conquistas: ${err.message}`);
    });

    // Verifica conquista de pontos (async)
    this.conquistasService.checkAndUnlock(
      createProfilePicDto.userId,
      'earn_points'
    ).catch(err => {
      this.logger.error(`Erro ao verificar conquistas de pontos: ${err.message}`);
    });

    // Marca etapa do onboarding como completa (async)
    this.onboardingService.checkAndCompleteProfilePic(
      createProfilePicDto.userId
    ).catch(err => {
      this.logger.error(`Erro ao verificar onboarding: ${err.message}`);
    });

    // Notificar se subiu de nível
    if (result.subiuNivel) {
      const { NivelHelper } = await import('../users/helpers/nivel.helper');
      const titulo = NivelHelper.getTitulo(result.novoNivel);
      await this.notificacoesService.create({
        userId: createProfilePicDto.userId,
        tipo: 'level_up',
        titulo: `Parabéns! Você subiu para o nível ${result.novoNivel}!`,
        mensagem: `Você alcançou o nível ${result.novoNivel} e ganhou o título: ${titulo}`,
      });
      this.logger.log(`Usuário ${createProfilePicDto.userId} subiu para o nível ${result.novoNivel}`);
    }

    return result.profilePic;
  }

  async findAll() {
    return this.prisma.profilePic.findMany();
  }
}
