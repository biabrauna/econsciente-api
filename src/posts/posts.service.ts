import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private conquistasService: ConquistasService,
    private notificacoesService: NotificacoesService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    // Cria o post e adiciona 3 pontos
    const result = await this.prisma.$transaction(async (tx) => {
      const post = await tx.posts.create({
        data: {
          userId: createPostDto.userId,
          url: createPostDto.url,
          likes: createPostDto.likes || 0
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

      // Adiciona 3 pontos por criar post
      await tx.user.update({
        where: { id: createPostDto.userId },
        data: {
          pontos: {
            increment: 3,
          },
        },
      });

      return post;
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

    return result;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.posts.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
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

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.posts.update({
      where: { id: postId },
      data: {
        likes: {
          increment: 1,
        },
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

    // Notificar dono do post (async)
    if (post.userId !== userId) {
      // Buscar nome do usuário que curtiu
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      if (liker) {
        this.notificacoesService.notifyLike(post.userId, liker.name, postId, userId)
          .catch(err => {
            this.logger.error(`Erro ao notificar like: ${err.message}`);
          });
      }
    }

    return post;
  }

  async unlikePost(postId: string) {
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    return this.prisma.posts.update({
      where: { id: postId },
      data: {
        likes: {
          decrement: post.likes > 0 ? 1 : 0,
        },
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
  }
}
