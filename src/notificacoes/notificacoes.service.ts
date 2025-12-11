import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';

@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova notificação para o usuário
   */
  async create(createNotificacaoDto: CreateNotificacaoDto) {
    // Valida o JSON dos metadados se fornecido
    if (createNotificacaoDto.metadata) {
      try {
        JSON.parse(createNotificacaoDto.metadata);
      } catch {
        this.logger.warn('Metadata inválido fornecido, continuando sem metadata');
        createNotificacaoDto.metadata = undefined;
      }
    }

    return this.prisma.notificacao.create({
      data: createNotificacaoDto,
    });
  }

  /**
   * Lista notificações de um usuário
   */
  async findByUser(userId: string, onlyUnread = false) {
    const where: any = { userId };

    if (onlyUnread) {
      where.lida = false;
    }

    return this.prisma.notificacao.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limita a 50 notificações mais recentes
    });
  }

  /**
   * Conta notificações não lidas de um usuário
   */
  async countUnread(userId: string) {
    return this.prisma.notificacao.count({
      where: {
        userId,
        lida: false,
      },
    });
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string, userId: string) {
    return this.prisma.notificacao.updateMany({
      where: {
        id,
        userId, // Garante que só pode marcar suas próprias notificações
      },
      data: {
        lida: true,
      },
    });
  }

  /**
   * Marca todas notificações de um usuário como lidas
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notificacao.updateMany({
      where: {
        userId,
        lida: false,
      },
      data: {
        lida: true,
      },
    });
  }

  /**
   * Deleta notificações antigas (mais de 30 dias)
   */
  async cleanOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.notificacao.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        lida: true, // Só deleta notificações já lidas
      },
    });

    this.logger.log(`Limpeza: ${result.count} notificações antigas removidas`);
    return result;
  }

  /**
   * Cria notificação de conquista desbloqueada
   */
  async notifyConquista(userId: string, conquistaNome: string, conquistaId: string) {
    return this.create({
      userId,
      tipo: 'conquista',
      titulo: 'Nova conquista desbloqueada! 🏆',
      mensagem: `Parabéns! Você desbloqueou "${conquistaNome}"`,
      metadata: JSON.stringify({ conquistaId }),
    });
  }

  /**
   * Cria notificação de novo seguidor
   */
  async notifyNewFollower(userId: string, followerName: string, followerId: string) {
    return this.create({
      userId,
      tipo: 'seguidor',
      titulo: 'Novo seguidor! 👥',
      mensagem: `${followerName} começou a seguir você`,
      metadata: JSON.stringify({ followerId }),
    });
  }

  /**
   * Cria notificação de like em post
   */
  async notifyLike(userId: string, likerName: string, postId: string, likerId: string) {
    return this.create({
      userId,
      tipo: 'like',
      titulo: 'Curtida no seu post! ❤️',
      mensagem: `${likerName} curtiu sua publicação`,
      metadata: JSON.stringify({ postId, likerId }),
    });
  }
}
