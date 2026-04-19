import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { NivelHelper } from './helpers/nivel.helper';
import { PostsService } from 'src/posts/posts.service';
import { awardPointsAndXp } from '../common/helpers/points.helper';

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
          nivel: true,
          xp: true,
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

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        dataNascimento: true,
        biografia: true,
        pontos: true,
        nivel: true,
        xp: true,
        seguidores: true,
        seguindo: true
      }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
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
            nivel: true,
            xp: true,
            seguidores: true,
            seguindo: true
          }
        });

        // Adiciona 5 pontos pela primeira biografia e atualiza XP/nível
        if (hadNoBio && hasNewBio) {
          const pontosGanhos = 5;
          const { novoXp, novoNivel, subiuNivel } = await awardPointsAndXp(tx, id, pontosGanhos);

          updated.xp = novoXp;
          updated.nivel = novoNivel;

          // Retornar também se subiu de nível
          (updated as any).subiuNivel = subiuNivel;
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

        // Notificar se subiu de nível
        if ((result as any).subiuNivel) {
          const titulo = NivelHelper.getTitulo(result.nivel);
          await this.notificacoesService.create({
            userId: id,
            tipo: 'level_up',
            titulo: `Parabéns! Você subiu para o nível ${result.nivel}!`,
            mensagem: `Você alcançou o nível ${result.nivel} e ganhou o título: ${titulo}`,
          });
          this.logger.log(`Usuário ${id} subiu para o nível ${result.nivel}`);
        }
      }

      return result;
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
      return { message: 'Usuário deletado com sucesso' };
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async getUserPosts(userId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Verifica se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const [data, total] = await Promise.all([
      this.prisma.posts.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.posts.count({ where: { userId } }),
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

  async getUserDesafios(userId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Verifica se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const [data, total] = await Promise.all([
      this.prisma.desafiosConcluidos.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          completedAt: 'desc',
        },
      }),
      this.prisma.desafiosConcluidos.count({ where: { userId } }),
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

  async getRanking(paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 100 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          pontos: true,
          nivel: true,
          xp: true,
          seguidores: true,
          seguindo: true,
          biografia: true,
          createdAt: true,
        },
        orderBy: {
          pontos: 'desc',
        },
      }),
      this.prisma.user.count(),
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

  async updateUserXpAndLevel(userId: number, pontosGanhos: number): Promise<{ xp: number; nivel: number; subiuNivel: boolean }> {
    // Buscar dados atuais do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, nivel: true, pontos: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Converter pontos em XP (1 ponto = 10 XP)
    const xpGanho = pontosGanhos * 10;

    // Calcular novo nível e XP
    const { novoXp, novoNivel, subiuNivel } = NivelHelper.adicionarXp(
      Number(user.xp),
      Number(user.nivel),
      xpGanho,
    );

    // Atualizar usuário
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: novoXp,
        nivel: novoNivel,
      },
    });

    // Se subiu de nível, notificar
    if (subiuNivel) {
      const titulo = NivelHelper.getTitulo(novoNivel);
      await this.notificacoesService.create({
        userId,
        tipo: 'level_up',
        titulo: `Parabéns! Você subiu para o nível ${novoNivel}!`,
        mensagem: `Você alcançou o nível ${novoNivel} e ganhou o título: ${titulo}`,
      });

      this.logger.log(`Usuário ${userId} subiu para o nível ${novoNivel}`);
    }

    return { xp: novoXp, nivel: novoNivel, subiuNivel };
  }
}