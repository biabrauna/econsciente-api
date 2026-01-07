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

  private async checkFollowConquistas(userId: number, isFollowed: number) {
    try {
      const { ConquistasService } = await import('../conquistas/conquistas.service');
      const conquistasService = new ConquistasService(this.prisma);

      // Verifica conquista de quem seguiu (first_follow)
      const conquistasFollower = await conquistasService.checkAndUnlock(userId, 'follow_user');

      // Verifica conquista de quem foi seguido (followers count)
      const conquistasFollowed = await conquistasService.checkAndUnlock(isFollowed, 'follow_user');

      // Notifica conquistas desbloqueadas
      for (const conquistaNome of conquistasFollower) {
        const conquista = await this.prisma.conquista.findUnique({
          where: { nome: conquistaNome },
        });
        if (conquista) {
          await this.notificacoesService.notifyConquista(userId, conquistaNome, conquista.id);
        }
      }

      for (const conquistaNome of conquistasFollowed) {
        const conquista = await this.prisma.conquista.findUnique({
          where: { nome: conquistaNome },
        });
        if (conquista) {
          await this.notificacoesService.notifyConquista(isFollowed, conquistaNome, conquista.id);
        }
      }
    } catch (err: any) {
      this.logger.error(`Erro ao verificar conquistas de follow: ${err.message}`);
    }
  }

  /**
   * Seguir um usuário
   */
  async follow(followerId: number, followingId: number) {
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
    const result = await this.prisma.$transaction(async (tx: any) => {
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

    // Verifica conquistas (async)
    this.checkFollowConquistas(followerId, followingId).catch(err => {
      this.logger.error(`Erro ao verificar conquistas: ${err.message}`);
    });

    return result;
  }

  /**
   * Deixar de seguir um usuário
   */
  async unfollow(followerId: number, followingId: number) {
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
    await this.prisma.$transaction(async (tx: any) => {
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
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
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
  async getFollowers(userId: number) {
    try {
      const followers = await this.prisma.follow.findMany({
        where: { followingId: userId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Buscar dados dos usuários separadamente
      const followerIds = followers.map(f => f.followerId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: followerIds } },
        select: {
          id: true,
          name: true,
          email: true,
          pontos: true,
          biografia: true,
        },
      });

      return users;
    } catch (error) {
      this.logger.error(`Erro ao buscar seguidores: ${error.message}`);
      return [];
    }
  }

  /**
   * Lista usuários que um usuário está seguindo
   */
  async getFollowing(userId: number) {
    try {
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Buscar dados dos usuários separadamente
      const followingIds = following.map(f => f.followingId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: followingIds } },
        select: {
          id: true,
          name: true,
          email: true,
          pontos: true,
          biografia: true,
        },
      });

      return users;
    } catch (error) {
      this.logger.error(`Erro ao buscar seguindo: ${error.message}`);
      return [];
    }
  }
}
