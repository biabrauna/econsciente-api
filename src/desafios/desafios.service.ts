import { Injectable, Logger, Inject, forwardRef, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioSubmetidoDto } from './dto/create-desafio-submetido.dto';
import { UpdateSubmissaoStatusDto } from './dto/update-submissao-status.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { UsersService } from '../users/users.service';
import { NivelHelper } from '../users/helpers/nivel.helper';
import { awardPointsAndXp } from '../common/helpers/points.helper';

export interface ChallengeValidationJob {
  submissaoId: number;
  userId: number;
  userName: string;
  desafioId: number;
  desafioTitle: string;
  imageUrl: string;
  pontos: number;
  submittedAt: string;
}

@Injectable()
export class DesafiosService {
  private readonly logger = new Logger(DesafiosService.name);

  constructor(
    private prisma: PrismaService,
    private conquistasService: ConquistasService,
    private notificacoesService: NotificacoesService,
    @Inject(forwardRef(() => OnboardingService))
    private onboardingService: OnboardingService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectQueue('challenge-validations')
    private validationQueue: Queue,
  ) {}

  async create(createDesafioDto: CreateDesafioDto) {
    return this.prisma.desafios.create({
      data: {
        ...createDesafioDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.desafios.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.desafios.count(),
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
    const desafio = await this.prisma.desafios.findUnique({ where: { id } });
    if (!desafio) throw new NotFoundException('Desafio não encontrado');
    return desafio;
  }

  async createDesafioSubmetido(dto: CreateDesafioSubmetidoDto) {
    const desafio = await this.prisma.desafios.findUnique({
      where: { id: dto.desafioId },
    });
    if (!desafio) throw new NotFoundException('Desafio não encontrado');

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, name: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const submissao = await this.prisma.desafiosSubmetidos.create({
      data: {
        userId: dto.userId,
        desafioId: dto.desafioId,
        imageUrl: dto.imageUrl,
        status: 'PENDING',
      },
      include: {
        desafio: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const job: ChallengeValidationJob = {
      submissaoId: submissao.id,
      userId: user.id,
      userName: user.name,
      desafioId: desafio.id,
      desafioTitle: desafio.desafios,
      imageUrl: dto.imageUrl,
      pontos: Number(desafio.valor),
      submittedAt: submissao.submittedAt.toISOString(),
    };

    await this.validationQueue.add('validate', job, {
      jobId: `submissao-${submissao.id}`,
      removeOnComplete: false,
      removeOnFail: false,
    });

    this.logger.log(`Submissão #${submissao.id} enfileirada para validação`);

    return submissao;
  }

  async patchSubmissaoStatus(id: number, dto: UpdateSubmissaoStatusDto) {
    const submissao = await this.prisma.desafiosSubmetidos.findUnique({
      where: { id },
      include: {
        desafio: true,
        user: { select: { id: true, name: true, nivel: true, xp: true } },
      },
    });

    if (!submissao) throw new NotFoundException('Submissão não encontrada');

    if (submissao.status !== 'PENDING') {
      throw new BadRequestException('Só é possível alterar submissões com status PENDING');
    }

    const updated = await this.prisma.desafiosSubmetidos.update({
      where: { id },
      data: { status: dto.status },
      include: { desafio: true, user: { select: { id: true, name: true } } },
    });

    if (dto.status === 'SUCCESS') {
      const pontos = Number(submissao.desafio.valor);

      const { novoNivel, subiuNivel } = await this.prisma.$transaction(async (tx: any) => {
        return awardPointsAndXp(tx, submissao.userId, pontos);
      });

      await this.notificacoesService.create({
        userId: submissao.userId,
        tipo: 'desafio_aprovado',
        titulo: 'Desafio aprovado! 🎉',
        mensagem: `Seu desafio "${submissao.desafio.desafios}" foi aprovado! Você ganhou ${pontos} pontos.`,
      });

      if (subiuNivel) {
        const tituloNivel = NivelHelper.getTitulo(novoNivel);
        await this.notificacoesService.create({
          userId: submissao.userId,
          tipo: 'level_up',
          titulo: `Nível ${novoNivel} desbloqueado! 🚀`,
          mensagem: `Parabéns! Você subiu para o nível ${novoNivel} e ganhou o título: ${tituloNivel}`,
        });
      }

      this.conquistasService.checkAndUnlock(submissao.userId, 'complete_challenge')
        .then(async (desbloqueadas) => {
          for (const nome of desbloqueadas) {
            const conquista = await this.prisma.conquista.findUnique({ where: { nome } });
            if (conquista) await this.notificacoesService.notifyConquista(submissao.userId, nome, conquista.id);
          }
        })
        .catch(err => this.logger.error(`Erro ao verificar conquistas: ${err.message}`));

      this.onboardingService.checkAndCompleteFirstChallenge(submissao.userId)
        .catch(err => this.logger.error(`Erro ao verificar onboarding: ${err.message}`));

      this.logger.log(`Submissão #${id} aprovada — userId=${submissao.userId}, pontos=${pontos}`);
    }

    if (dto.status === 'ERROR') {
      await this.notificacoesService.create({
        userId: submissao.userId,
        tipo: 'desafio_rejeitado',
        titulo: 'Submissão rejeitada',
        mensagem: `Sua submissão para o desafio "${submissao.desafio.desafios}" foi rejeitada. Tente novamente com uma foto mais clara.`,
      });

      this.logger.log(`Submissão #${id} rejeitada — userId=${submissao.userId}`);
    }

    return updated;
  }

  async findSubmissoes(paginationDto: PaginationDto, status?: string): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.desafiosSubmetidos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          desafio: { select: { id: true, desafios: true, valor: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.desafiosSubmetidos.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  async findSubmissoesByUser(userId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.desafiosSubmetidos.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: { desafio: { select: { id: true, desafios: true, valor: true } } },
      }),
      this.prisma.desafiosSubmetidos.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  async searchDesafio(search: string) {
    return this.prisma.desafios.findMany({
      where: { desafios: { contains: search, mode: 'insensitive' } },
    });
  }

  // Mantém compatibilidade com vision.controller
  async createDesafioConcluido(dto: { desafioId: number; userId: number; imageUrl?: string }) {
    return this.createDesafioSubmetido({
      desafioId: dto.desafioId,
      userId: dto.userId,
      imageUrl: dto.imageUrl || '',
    });
  }
}
