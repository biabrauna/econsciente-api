import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { ConquistaDto } from './dto/conquista-response.dto';

interface CriterioDesafios {
  type: 'desafios_completados';
  count: number;
}

interface CriterioPontos {
  type: 'pontos_totais';
  amount: number;
}

interface CriterioPerfil {
  type: 'action';
  action: 'upload_profile_pic' | 'update_bio' | 'complete_profile';
}

interface CriterioSocial {
  type: 'social';
  action: 'first_post' | 'first_like' | 'first_follow' | 'followers';
  count?: number;
}

type Criterio = CriterioDesafios | CriterioPontos | CriterioPerfil | CriterioSocial;

@Injectable()
export class ConquistasService {
  private readonly logger = new Logger(ConquistasService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova conquista no sistema
   */
  async create(createConquistaDto: CreateConquistaDto) {
    // Valida o JSON do critério
    try {
      JSON.parse(createConquistaDto.criterio);
    } catch {
      throw new BadRequestException('Critério deve ser um JSON válido');
    }

    return this.prisma.conquista.create({
      data: {
        ...createConquistaDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Lista todas as conquistas disponíveis
   */
  async findAll() {
    return this.prisma.conquista.findMany({
      orderBy: { tipo: 'asc' },
    });
  }

  /**
   * Lista conquistas de um usuário específico com status de desbloqueio
   */
  async findUserConquistas(userId: number): Promise<ConquistaDto[]> {
    const todasConquistas = await this.prisma.conquista.findMany({
      orderBy: { tipo: 'asc' },
    });

    const conquistasUsuario = await this.prisma.conquistaUsuario.findMany({
      where: { userId },
      select: {
        conquistaId: true,
        desbloqueadaEm: true,
      },
    });

    const conquistasMap = new Map(
      conquistasUsuario.map((c: any) => [c.conquistaId, c.desbloqueadaEm])
    );

    return todasConquistas.map((conquista: any) => {
      const desbloqueadaEm = conquistasMap.get(conquista.id) as Date | undefined;
      return {
        id: conquista.id,
        nome: conquista.nome,
        descricao: conquista.descricao,
        icone: conquista.icone,
        tipo: conquista.tipo,
        pontosRecompensa: conquista.pontosRecompensa,
        desbloqueada: !!desbloqueadaEm,
        desbloqueadaEm: desbloqueadaEm?.toISOString(),
      };
    });
  }

  /**
   * Desbloqueia uma conquista para um usuário
   * Retorna true se desbloqueou, false se já estava desbloqueada
   */
  async unlock(userId: number, conquistaId: number): Promise<boolean> {
    // Verifica se a conquista existe
    const conquista = await this.prisma.conquista.findUnique({
      where: { id: conquistaId },
    });

    if (!conquista) {
      throw new NotFoundException('Conquista não encontrada');
    }

    // Verifica se já foi desbloqueada
    const existing = await this.prisma.conquistaUsuario.findUnique({
      where: {
        userId_conquistaId: {
          userId,
          conquistaId,
        },
      },
    });

    if (existing) {
      return false; // Já estava desbloqueada
    }

    // Desbloqueia e adiciona pontos ao usuário em uma transação
    const transactionResult = await this.prisma.$transaction(async (tx: any) => {
      // Cria o registro de conquista desbloqueada
      await tx.conquistaUsuario.create({
        data: {
          userId,
          conquistaId,
        },
      });

      // Adiciona os pontos de recompensa e atualiza XP/nível
      let subiuNivel = false;
      if (conquista.pontosRecompensa > 0) {
        // Buscar dados atuais do usuário
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { xp: true, nivel: true },
        });

        // Converter pontos em XP (1 ponto = 10 XP)
        const xpGanho = Number(conquista.pontosRecompensa) * 10;
        const { NivelHelper } = await import('../users/helpers/nivel.helper');
        const { novoXp, novoNivel, subiuNivel: subiu } = NivelHelper.adicionarXp(
          Number(currentUser.xp),
          Number(currentUser.nivel),
          xpGanho,
        );

        subiuNivel = subiu;

        await tx.user.update({
          where: { id: userId },
          data: {
            pontos: {
              increment: Number(conquista.pontosRecompensa),
            },
            xp: novoXp,
            nivel: novoNivel,
          },
        });
      }

      return { subiuNivel };
    });

    // Notificar se subiu de nível
    if (transactionResult.subiuNivel) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { nivel: true },
      });

      if (user) {
        const { NivelHelper } = await import('../users/helpers/nivel.helper');
        const titulo = NivelHelper.getTitulo(Number(user.nivel));
        const { NotificacoesService } = await import('../notificacoes/notificacoes.service');
        const notificacoesService = new NotificacoesService(this.prisma);

        await notificacoesService.create({
          userId,
          tipo: 'level_up',
          titulo: `Parabéns! Você subiu para o nível ${user.nivel}!`,
          mensagem: `Você alcançou o nível ${user.nivel} e ganhou o título: ${titulo}`,
        });

        this.logger.log(`Usuário ${userId} subiu para o nível ${user.nivel}`);
      }
    }

    this.logger.log(`Conquista "${conquista.nome}" desbloqueada para usuário ${userId}`);
    return true; // Desbloqueou agora
  }

  /**
   * Verifica e desbloqueia conquistas automaticamente baseado em ações
   */
  async checkAndUnlock(userId: number, action: string, metadata?: any): Promise<string[]> {
    const conquistasDesbloqueadas: string[] = [];

    // Busca conquistas que podem ser desbloqueadas com base na ação
    const conquistas = await this.prisma.conquista.findMany();

    for (const conquista of conquistas) {
      try {
        const criterio: Criterio = JSON.parse(conquista.criterio);
        let shouldUnlock = false;

        // Verifica se já foi desbloqueada
        const existing = await this.prisma.conquistaUsuario.findUnique({
          where: {
            userId_conquistaId: {
              userId,
              conquistaId: conquista.id,
            },
          },
        });

        if (existing) continue; // Já desbloqueada, pula

        // Verifica critérios baseados na ação
        switch (action) {
          case 'upload_profile_pic':
            if (criterio.type === 'action' && criterio.action === 'upload_profile_pic') {
              shouldUnlock = true;
            }
            break;

          case 'update_bio':
            if (criterio.type === 'action' && criterio.action === 'update_bio') {
              shouldUnlock = true;
            }
            break;

          case 'complete_challenge':
            if (criterio.type === 'desafios_completados') {
              const count = await this.prisma.desafiosSubmetidos.count({
                where: { userId, status: 'SUCCESS' },
              });
              shouldUnlock = count >= criterio.count;
            }
            break;

          case 'earn_points':
            if (criterio.type === 'pontos_totais') {
              const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { pontos: true },
              });
              shouldUnlock = !!(user && user.pontos >= criterio.amount);
            }
            break;

          case 'create_post':
            if (criterio.type === 'social' && criterio.action === 'first_post') {
              const postCount = await this.prisma.posts.count({
                where: { userId },
              });
              shouldUnlock = postCount >= 1;
            }
            break;

          case 'like_post':
            if (criterio.type === 'social' && criterio.action === 'first_like') {
              shouldUnlock = true;
            }
            break;

          case 'follow_user':
            if (criterio.type === 'social' && criterio.action === 'first_follow') {
              shouldUnlock = true;
            }
            if (criterio.type === 'social' && criterio.action === 'followers' && criterio.count) {
              const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { seguidores: true },
              });
              shouldUnlock = !!(user && user.seguidores >= criterio.count);
            }
            break;
        }

        if (shouldUnlock) {
          const unlocked = await this.unlock(userId, conquista.id);
          if (unlocked) {
            conquistasDesbloqueadas.push(conquista.nome);
          }
        }
      } catch (error) {
        this.logger.error(`Erro ao verificar conquista ${conquista.id}: ${error.message}`);
      }
    }

    return conquistasDesbloqueadas;
  }

  /**
   * Seed inicial de conquistas (desenvolvimento)
   */
  async seedConquistas() {
    const conquistas: CreateConquistaDto[] = [
      // Conquistas de Perfil
      {
        nome: 'Primeira Foto',
        descricao: 'Adicione sua primeira foto de perfil',
        icone: '📷',
        tipo: 'perfil',
        criterio: JSON.stringify({ type: 'action', action: 'upload_profile_pic' }),
        pontosRecompensa: 10,
      },
      {
        nome: 'Quem Sou Eu?',
        descricao: 'Escreva sua biografia',
        icone: '✍️',
        tipo: 'perfil',
        criterio: JSON.stringify({ type: 'action', action: 'update_bio' }),
        pontosRecompensa: 5,
      },

      // Conquistas de Desafios
      {
        nome: 'Primeiro Passo',
        descricao: 'Complete seu primeiro desafio',
        icone: '🌱',
        tipo: 'desafios',
        criterio: JSON.stringify({ type: 'desafios_completados', count: 1 }),
        pontosRecompensa: 15,
      },
      {
        nome: 'Eco Guerreiro',
        descricao: 'Complete 5 desafios',
        icone: '⚔️',
        tipo: 'desafios',
        criterio: JSON.stringify({ type: 'desafios_completados', count: 5 }),
        pontosRecompensa: 30,
      },
      {
        nome: 'Guardião Verde',
        descricao: 'Complete 10 desafios',
        icone: '🛡️',
        tipo: 'desafios',
        criterio: JSON.stringify({ type: 'desafios_completados', count: 10 }),
        pontosRecompensa: 50,
      },

      // Conquistas de Pontos
      {
        nome: 'Centelha Verde',
        descricao: 'Alcance 50 pontos',
        icone: '✨',
        tipo: 'pontos',
        criterio: JSON.stringify({ type: 'pontos_totais', amount: 50 }),
        pontosRecompensa: 10,
      },
      {
        nome: 'Estrela Eco',
        descricao: 'Alcance 100 pontos',
        icone: '⭐',
        tipo: 'pontos',
        criterio: JSON.stringify({ type: 'pontos_totais', amount: 100 }),
        pontosRecompensa: 25,
      },
      {
        nome: 'Lenda Ambiental',
        descricao: 'Alcance 500 pontos',
        icone: '🏆',
        tipo: 'pontos',
        criterio: JSON.stringify({ type: 'pontos_totais', amount: 500 }),
        pontosRecompensa: 100,
      },

      // Conquistas Sociais
      {
        nome: 'Primeira Publicação',
        descricao: 'Faça seu primeiro post',
        icone: '📸',
        tipo: 'social',
        criterio: JSON.stringify({ type: 'social', action: 'first_post' }),
        pontosRecompensa: 10,
      },
      {
        nome: 'Curtidor Consciente',
        descricao: 'Dê sua primeira curtida',
        icone: '❤️',
        tipo: 'social',
        criterio: JSON.stringify({ type: 'social', action: 'first_like' }),
        pontosRecompensa: 5,
      },
    ];

    const created = [];
    for (const conquista of conquistas) {
      try {
        const existing = await this.prisma.conquista.findUnique({
          where: { nome: conquista.nome },
        });

        if (!existing) {
          const result = await this.create(conquista);
          created.push(result);
        }
      } catch (error) {
        this.logger.error(`Erro ao criar conquista ${conquista.nome}: ${error.message}`);
      }
    }

    return created;
  }
}
