import { Injectable, Logger, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioConcluidoDto } from './dto/create-desafio-concluido.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { UsersService } from '../users/users.service';

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
  ) {}

  async create(createDesafioDto: CreateDesafioDto) {
    return this.prisma.desafios.create({
      data: createDesafioDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.desafios.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
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

  async findOne(id: string) {
    const desafio = await this.prisma.desafios.findUnique({
      where: { id },
    });

    if (!desafio) {
      throw new NotFoundException('Desafio não encontrado');
    }

    return desafio;
  }

  async createDesafioConcluido(
    createDesafioConcluidoDto: CreateDesafioConcluidoDto,
  ) {
    // Busca o desafio para pegar os pontos
    const desafio = await this.prisma.desafios.findUnique({
      where: { id: createDesafioConcluidoDto.desafioId },
    });

    // Cria o registro de desafio concluído e adiciona pontos em uma transação
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Cria o registro
      const desafioConcluido = await tx.desafiosConcluidos.create({
        data: createDesafioConcluidoDto,
        include: {
          desafio: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              pontos: true,
              nivel: true,
              xp: true,
            }
          }
        }
      });

      // Adiciona pontos ao usuário
      if (desafio && desafio.valor > 0) {
        const userUpdated = await tx.user.update({
          where: { id: createDesafioConcluidoDto.userId },
          data: {
            pontos: {
              increment: desafio.valor,
            },
          },
          select: {
            pontos: true,
            nivel: true,
            xp: true,
          },
        });

        // Atualiza os dados do usuário no objeto retornado
        desafioConcluido.user.pontos = userUpdated.pontos;
        desafioConcluido.user.nivel = userUpdated.nivel;
        desafioConcluido.user.xp = userUpdated.xp;
      }

      return desafioConcluido;
    });

    // Verifica conquistas relacionadas a desafios (async, não bloqueia resposta)
    this.conquistasService.checkAndUnlock(
      createDesafioConcluidoDto.userId,
      'complete_challenge'
    ).then(async (conquistasDesbloqueadas) => {
      // Cria notificações para cada conquista desbloqueada
      for (const conquistaNome of conquistasDesbloqueadas) {
        const conquista = await this.prisma.conquista.findUnique({
          where: { nome: conquistaNome },
        });
        if (conquista) {
          await this.notificacoesService.notifyConquista(
            createDesafioConcluidoDto.userId,
            conquistaNome,
            conquista.id
          );
        }
      }
    }).catch(err => {
      this.logger.error(`Erro ao verificar conquistas: ${err.message}`);
    });

    // Verifica conquistas de pontos (async)
    if (desafio && desafio.valor > 0) {
      this.conquistasService.checkAndUnlock(
        createDesafioConcluidoDto.userId,
        'earn_points'
      ).then(async (conquistasDesbloqueadas) => {
        for (const conquistaNome of conquistasDesbloqueadas) {
          const conquista = await this.prisma.conquista.findUnique({
            where: { nome: conquistaNome },
          });
          if (conquista) {
            await this.notificacoesService.notifyConquista(
              createDesafioConcluidoDto.userId,
              conquistaNome,
              conquista.id
            );
          }
        }
      }).catch(err => {
        this.logger.error(`Erro ao verificar conquistas de pontos: ${err.message}`);
      });

      // Marca etapa do onboarding como completa (async)
      this.onboardingService.checkAndCompleteFirstChallenge(
        createDesafioConcluidoDto.userId
      ).catch(err => {
        this.logger.error(`Erro ao verificar onboarding: ${err.message}`);
      });

      // Atualizar XP e nível (async)
      this.usersService.updateUserXpAndLevel(
        createDesafioConcluidoDto.userId,
        desafio.valor
      ).catch(err => {
        this.logger.error(`Erro ao atualizar XP: ${err.message}`);
      });
    }

    return result;
  }

  async searchDesafio(search: string) {
    return this.prisma.desafios.findMany({
      where: {
        desafios: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });
  }
}
