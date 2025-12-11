import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly SESSION_EXPIRY_DAYS = 30;

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova sessão para o usuário
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);

    await this.prisma.session.create({
      data: {
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        expiresAt,
        lastActivity: new Date(),
      },
    });

    this.logger.log(`Nova sessão criada para usuário ${userId}`);
    return sessionToken;
  }

  /**
   * Valida e atualiza a última atividade de uma sessão
   */
  async validateSession(sessionToken: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return false;
    }

    // Verifica se a sessão expirou
    if (session.expiresAt < new Date() || !session.isActive) {
      await this.invalidateSession(sessionToken);
      return false;
    }

    // Atualiza última atividade
    await this.prisma.session.update({
      where: { sessionToken },
      data: { lastActivity: new Date() },
    });

    return true;
  }

  /**
   * Invalida uma sessão específica
   */
  async invalidateSession(sessionToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { sessionToken },
      data: { isActive: false },
    });

    this.logger.log(`Sessão ${sessionToken.substring(0, 10)}... invalidada`);
  }

  /**
   * Invalida todas as sessões de um usuário
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    this.logger.log(`Todas as sessões do usuário ${userId} foram invalidadas`);
  }

  /**
   * Lista todas as sessões ativas de um usuário
   */
  async getUserActiveSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        sessionToken: true,
        ipAddress: true,
        userAgent: true,
        lastActivity: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  /**
   * Remove sessões expiradas do banco de dados (cleanup)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
    });

    this.logger.log(`${result.count} sessões expiradas removidas`);
    return result.count;
  }

  /**
   * Gera um token único para a sessão
   */
  private generateSessionToken(): string {
    const randomBytes = require('crypto').randomBytes(32);
    return randomBytes.toString('hex');
  }
}
