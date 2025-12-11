import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class ComentariosService {
  private readonly logger = new Logger(ComentariosService.name);

  constructor(
    private prisma: PrismaService,
    private notificacoesService: NotificacoesService,
  ) {}

  async create(createComentarioDto: CreateComentarioDto) {
    const comentario = await this.prisma.comentario.create({
      data: {
        postId: createComentarioDto.postId,
        userId: createComentarioDto.userId,
        userName: createComentarioDto.userName,
        texto: createComentarioDto.texto,
      },
    });

    // Buscar dono do post para notificar
    const post = await this.prisma.posts.findUnique({
      where: { id: createComentarioDto.postId },
      select: { userId: true },
    });

    // Notificar dono do post (se não for ele mesmo comentando)
    if (post && post.userId !== createComentarioDto.userId) {
      this.notificacoesService
        .create({
          userId: post.userId,
          tipo: 'comentario',
          titulo: 'Novo comentário',
          mensagem: `${createComentarioDto.userName} comentou no seu post`,
          metadata: JSON.stringify({
            postId: createComentarioDto.postId,
            comentarioId: comentario.id,
            userName: createComentarioDto.userName,
          }),
        })
        .catch((err) => {
          this.logger.error(`Erro ao notificar comentário: ${err.message}`);
        });
    }

    return comentario;
  }

  async findByPost(postId: string) {
    return this.prisma.comentario.findMany({
      where: { postId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string, userId: string) {
    const comentario = await this.prisma.comentario.findUnique({
      where: { id },
    });

    if (!comentario) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Apenas o autor pode deletar
    if (comentario.userId !== userId) {
      throw new NotFoundException('Você não pode deletar este comentário');
    }

    return this.prisma.comentario.delete({
      where: { id },
    });
  }

  async count(postId: string): Promise<number> {
    return this.prisma.comentario.count({
      where: { postId },
    });
  }
}
