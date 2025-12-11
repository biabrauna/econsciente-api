import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private conquistasService: ConquistasService,
    private notificacoesService: NotificacoesService,
    @Inject(forwardRef(() => OnboardingService))
    private onboardingService: OnboardingService,
  ) {}

  async findAll(paginationDto: PaginationDto, search?: string): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          dataNascimento: true,
          biografia: true,
          pontos: true,
          seguidores: true,
          seguindo: true,
          createdAt: true,
        },
        orderBy: search
          ? {
              pontos: 'desc', // Ordenar por pontos quando buscar
            }
          : {
              createdAt: 'desc',
            },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        dataNascimento: true,
        biografia: true,
        pontos: true,
        seguidores: true,
        seguindo: true
      }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Verifica se está atualizando a biografia
      const userBefore = await this.prisma.user.findUnique({
        where: { id },
        select: { biografia: true },
      });

      const hadNoBio = !userBefore?.biografia || userBefore.biografia.trim() === '';
      const hasNewBio = updateUserDto.biografia && updateUserDto.biografia.trim() !== '';

      // Atualiza o usuário e adiciona pontos se for a primeira bio
      const result = await this.prisma.$transaction(async (tx: any) => {
        const updated = await tx.user.update({
          where: { id },
          data: {
            ...updateUserDto,
            ...(updateUserDto.dataNascimento && {
              dataNascimento: new Date(updateUserDto.dataNascimento)
            })
          },
          select: {
            id: true,
            name: true,
            email: true,
            dataNascimento: true,
            biografia: true,
            pontos: true,
            seguidores: true,
            seguindo: true
          }
        });

        // Adiciona 5 pontos pela primeira biografia
        if (hadNoBio && hasNewBio) {
          await tx.user.update({
            where: { id },
            data: {
              pontos: {
                increment: 5,
              },
            },
          });
          updated.pontos += 5; // Atualiza o objeto retornado
        }

        return updated;
      });

      // Verifica conquista de biografia (async)
      if (hadNoBio && hasNewBio) {
        this.conquistasService.checkAndUnlock(id, 'update_bio')
          .then(async (conquistasDesbloqueadas) => {
            for (const conquistaNome of conquistasDesbloqueadas) {
              const conquista = await this.prisma.conquista.findUnique({
                where: { nome: conquistaNome },
              });
              if (conquista) {
                await this.notificacoesService.notifyConquista(
                  id,
                  conquistaNome,
                  conquista.id
                );
              }
            }
          }).catch(err => {
            this.logger.error(`Erro ao verificar conquistas: ${err.message}`);
          });

        // Verifica conquista de pontos
        this.conquistasService.checkAndUnlock(id, 'earn_points')
          .catch(err => {
            this.logger.error(`Erro ao verificar conquistas de pontos: ${err.message}`);
          });

        // Marca etapa do onboarding como completa (async)
        this.onboardingService.checkAndCompleteBio(id)
          .catch(err => {
            this.logger.error(`Erro ao verificar onboarding: ${err.message}`);
          });
      }

      return result;
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
      return { message: 'Usuário deletado com sucesso' };
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}