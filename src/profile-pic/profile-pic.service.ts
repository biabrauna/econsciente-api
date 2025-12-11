import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilePicDto } from './dto/create-profile-pic.dto';
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

  async create(createProfilePicDto: CreateProfilePicDto) {
    // Cria/atualiza a foto de perfil e adiciona 5 pontos
    const result = await this.prisma.$transaction(async (tx) => {
      // Deleta foto antiga se existir (constraint unique no userId)
      await tx.profilePic.deleteMany({
        where: { userId: createProfilePicDto.userId },
      });

      // Cria a nova foto
      const profilePic = await tx.profilePic.create({
        data: createProfilePicDto
      });

      // Adiciona 5 pontos por upload de foto
      await tx.user.update({
        where: { id: createProfilePicDto.userId },
        data: {
          pontos: {
            increment: 5,
          },
        },
      });

      return profilePic;
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

    return result;
  }

  async findAll() {
    return this.prisma.profilePic.findMany();
  }
}
