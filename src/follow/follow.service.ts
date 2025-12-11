import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class FollowService {
  private readonly logger = new Logger(FollowService.name);

  constructor(
    private prisma: PrismaService,
    private notificacoesService: NotificacoesService,
  ) {}

  /**
   * Seguir um usuário
   */
  async follow(followerId: string, followingId: string) {
    // Não pode seguir a si mesmo
    if (followerId === followingId) {
      throw new BadRequestException('Você não pode seguir a si mesmo');
    }

    // Verifica se o usuário a ser seguido existe
    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, name: true },
    });

    if (!userToFollow) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já segue
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Você já segue este usuário');
    }

    // Cria o relacionamento e atualiza contadores em transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Cria o follow
      const follow = await tx.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      // Incrementa contador de "seguindo" do seguidor
      await tx.user.update({
        where: { id: followerId },
        data: {
          seguindo: {
            increment: 1,
          },
        },
      });

      // Incrementa contador de "seguidores" do usuário sendo seguido
      await tx.user.update({
        where: { id: followingId },
        data: {
          seguidores: {
            increment: 1,
          },
        },
      });

      return follow;
    });

    // Cria notificação para o usuário que foi seguido (async)
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    if (follower) {
      this.notificacoesService.notifyNewFollower(
        followingId,
        follower.name,
        followerId
      ).catch(err => {
        this.logger.error(`Erro ao criar notificação de follow: ${err.message}`);
      });
    }

    return result;
  }

  /**
   * Deixar de seguir um usuário
   */
  async unfollow(followerId: string, followingId: string) {
    // Verifica se segue
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new BadRequestException('Você não segue este usuário');
    }

    // Remove o relacionamento e atualiza contadores em transação
    await this.prisma.$transaction(async (tx) => {
      // Deleta o follow
      await tx.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      // Decrementa contador de "seguindo" do seguidor
      await tx.user.update({
        where: { id: followerId },
        data: {
          seguindo: {
            decrement: 1,
          },
        },
      });

      // Decrementa contador de "seguidores" do usuário
      await tx.user.update({
        where: { id: followingId },
        data: {
          seguidores: {
            decrement: 1,
          },
        },
      });
    });

    return { message: 'Deixou de seguir com sucesso' };
  }

  /**
   * Verifica se um usuário segue outro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    // Não pode seguir a si mesmo
    if (followerId === followingId) {
      return false;
    }

    try {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      return !!follow;
    } catch (error) {
      this.logger.error(`Erro ao verificar isFollowing: ${error.message}`);
      return false;
    }
  }

  /**
   * Lista seguidores de um usuário
   */
  async getFollowers(userId: string) {
    try {
      const followers = await this.prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              pontos: true,
              biografia: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return followers.map(f => f.follower);
    } catch (error) {
      this.logger.error(`Erro ao buscar seguidores: ${error.message}`);
      return [];
    }
  }

  /**
   * Lista usuários que um usuário está seguindo
   */
  async getFollowing(userId: string) {
    try {
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              pontos: true,
              biografia: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return following.map(f => f.following);
    } catch (error) {
      this.logger.error(`Erro ao buscar seguindo: ${error.message}`);
      return [];
    }
  }
}
