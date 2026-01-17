import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private conquistasService: ConquistasService,
    private notificacoesService: NotificacoesService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    // Cria o post e adiciona 3 pontos
    const result = await this.prisma.$transaction(async (tx: any) => {
      const post = await tx.posts.create({
        data: {
          userId: createPostDto.userId,
          texto: createPostDto.url || '',
          imagens: createPostDto.url ? [createPostDto.url] : [],
          curtidas: createPostDto.likes || 0
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // Buscar dados atuais do usuário para calcular XP/nível
      const currentUser = await tx.user.findUnique({
        where: { id: createPostDto.userId },
        select: { xp: true, nivel: true },
      });

      // Converter pontos em XP (1 ponto = 10 XP)
      const pontosGanhos = 3;
      const xpGanho = pontosGanhos * 10;
      const { NivelHelper } = await import('../users/helpers/nivel.helper');
      const { novoXp, novoNivel, subiuNivel } = NivelHelper.adicionarXp(
        Number(currentUser.xp),
        Number(currentUser.nivel),
        xpGanho,
      );

      // Adiciona 3 pontos por criar post e atualiza XP/nível
      await tx.user.update({
        where: { id: createPostDto.userId },
        data: {
          pontos: {
            increment: pontosGanhos,
          },
          xp: novoXp,
          nivel: novoNivel,
        },
      });

      return { post, nivelAnterior: currentUser.nivel, novoNivel, subiuNivel };
    });

    // Verifica conquista de primeiro post (async)
    this.conquistasService.checkAndUnlock(createPostDto.userId, 'create_post')
      .then(async (conquistasDesbloqueadas) => {
        for (const conquistaNome of conquistasDesbloqueadas) {
          const conquista = await this.prisma.conquista.findUnique({
            where: { nome: conquistaNome },
          });
          if (conquista) {
            await this.notificacoesService.notifyConquista(
              createPostDto.userId,
              conquistaNome,
              conquista.id
            );
          }
        }
      }).catch(err => {
        this.logger.error(`Erro ao verificar conquistas: ${err.message}`);
      });

    // Verifica conquista de pontos (async)
    this.conquistasService.checkAndUnlock(createPostDto.userId, 'earn_points')
      .catch(err => {
        this.logger.error(`Erro ao verificar conquistas de pontos: ${err.message}`);
      });

    // Notificar se subiu de nível
    if (result.subiuNivel) {
      const { NivelHelper } = await import('../users/helpers/nivel.helper');
      const titulo = NivelHelper.getTitulo(result.novoNivel);
      await this.notificacoesService.create({
        userId: createPostDto.userId,
        tipo: 'level_up',
        titulo: `Parabéns! Você subiu para o nível ${result.novoNivel}!`,
        mensagem: `Você alcançou o nível ${result.novoNivel} e ganhou o título: ${titulo}`,
      });
      this.logger.log(`Usuário ${createPostDto.userId} subiu para o nível ${result.novoNivel}`);
    }

    return result.post;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.posts.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.posts.count(),
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

  async likePost(postId: number, userId: number) {
    // Verificar se o usuário já curtiu o post
    const existingLike = await this.prisma.userLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      throw new Error('Você já curtiu este post');
    }

    // Criar o like em uma transação
    // O trigger do banco sincronizará automaticamente o contador Posts.curtidas
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Criar registro de like
      await tx.userLike.create({
        data: {
          userId,
          postId,
        },
      });

      // Buscar post atualizado (o trigger já atualizou curtidas)
      const post = await tx.posts.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          userLikes: {
            select: {
              userId: true,
            },
          },
        }
      });

      return post;
    });

    // Notificar dono do post (async)
    if (result.userId !== userId) {
      // Buscar nome do usuário que curtiu
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      if (liker) {
        this.notificacoesService.notifyLike(result.userId, liker.name, postId, userId)
          .catch(err => {
            this.logger.error(`Erro ao notificar like: ${err.message}`);
          });
      }
    }

    return result;
  }

  async unlikePost(postId: number, userId: number) {
    // Verificar se o like existe
    const existingLike = await this.prisma.userLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existingLike) {
      throw new Error('Você não curtiu este post');
    }

    // Deletar o like em uma transação
    // O trigger do banco sincronizará automaticamente o contador Posts.curtidas
    return this.prisma.$transaction(async (tx: any) => {
      // Deletar registro de like
      await tx.userLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      // Buscar post atualizado (o trigger já atualizou curtidas)
      const post = await tx.posts.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          userLikes: {
            select: {
              userId: true,
            },
          },
        }
      });

      return post;
    });
  }

  async getFeed(userId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Buscar IDs dos usuários que o usuário atual segue
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // Incluir posts próprios sempre
    followingIds.push(userId);

    const [data, total] = await Promise.all([
      this.prisma.posts.findMany({
        where: {
          userId: {
            in: followingIds,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          userLikes: {
            select: {
              userId: true,
            },
          },
        },
      }),
      this.prisma.posts.count({
        where: {
          userId: {
            in: followingIds,
          },
        },
      }),
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
}
