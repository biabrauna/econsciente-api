import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConquistasService } from './conquistas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConquistasService', () => {
  let service: ConquistasService;
  let prismaService: PrismaService;

  const mockConquista = {
    id: 1,
    nome: 'Primeiro Passo',
    descricao: 'Complete seu primeiro desafio',
    icone: '🌱',
    tipo: 'desafios',
    criterio: JSON.stringify({ type: 'desafios_completados', count: 1 }),
    pontosRecompensa: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockConquistaSocial = {
    id: 2,
    nome: 'Primeira Publicação',
    descricao: 'Faça seu primeiro post',
    icone: '📸',
    tipo: 'social',
    criterio: JSON.stringify({ type: 'social', action: 'first_post' }),
    pontosRecompensa: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUser = {
    id: 42,
    pontos: 100,
    xp: 500,
    nivel: 2,
    seguidores: 3,
  };

  const mockPrismaService = {
    conquista: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    conquistaUsuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    // Nome correto do model Prisma: desafiosSubmetidos (não desafiosConcluidos)
    desafiosSubmetidos: {
      count: jest.fn(),
    },
    posts: {
      count: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConquistasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConquistasService>(ConquistasService);
    prismaService = module.get<PrismaService>(PrismaService);

    // jest.clearAllMocks() limpa implementações — restaurar $transaction a cada teste
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      nome: 'Nova Conquista',
      descricao: 'Descrição',
      icone: '🏆',
      tipo: 'social',
      criterio: JSON.stringify({ type: 'social', action: 'first_post' }),
      pontosRecompensa: 10,
    };

    it('deve criar uma conquista com sucesso', async () => {
      mockPrismaService.conquista.create.mockResolvedValue(mockConquista);

      const result = await service.create(createDto);

      expect(result).toEqual(mockConquista);
      expect(mockPrismaService.conquista.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ nome: createDto.nome }) }),
      );
    });

    it('deve lançar BadRequestException quando o criterio não é JSON válido', async () => {
      const invalidDto = { ...createDto, criterio: 'not-valid-json{' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Critério deve ser um JSON válido',
      );
    });

    it('não deve chamar prisma.create quando o criterio é inválido', async () => {
      const invalidDto = { ...createDto, criterio: '{broken' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.conquista.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as conquistas ordenadas por tipo', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista, mockConquistaSocial]);

      const result = await service.findAll();

      expect(result).toEqual([mockConquista, mockConquistaSocial]);
      expect(mockPrismaService.conquista.findMany).toHaveBeenCalledWith({
        orderBy: { tipo: 'asc' },
      });
    });

    it('deve retornar array vazio quando não existem conquistas', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findUserConquistas', () => {
    it('deve retornar conquistas com status de desbloqueio mesclado', async () => {
      const desbloqueadaEm = new Date('2024-06-01');
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista, mockConquistaSocial]);
      mockPrismaService.conquistaUsuario.findMany.mockResolvedValue([
        { conquistaId: mockConquista.id, desbloqueadaEm },
      ]);

      const result = await service.findUserConquistas(mockUser.id);

      expect(result).toHaveLength(2);
      const primeira = result.find((c) => c.id === mockConquista.id)!;
      const segunda = result.find((c) => c.id === mockConquistaSocial.id)!;

      expect(primeira.desbloqueada).toBe(true);
      expect(primeira.desbloqueadaEm).toBe(desbloqueadaEm.toISOString());
      expect(segunda.desbloqueada).toBe(false);
      expect(segunda.desbloqueadaEm).toBeUndefined();
    });

    it('deve retornar todas as conquistas como bloqueadas quando o usuário não desbloqueou nenhuma', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista]);
      mockPrismaService.conquistaUsuario.findMany.mockResolvedValue([]);

      const result = await service.findUserConquistas(99);

      expect(result[0].desbloqueada).toBe(false);
    });
  });

  describe('unlock', () => {
    it('deve desbloquear uma conquista e retornar true', async () => {
      const conquistaSemPontos = { ...mockConquista, pontosRecompensa: 0 };
      mockPrismaService.conquista.findUnique.mockResolvedValue(conquistaSemPontos);
      mockPrismaService.conquistaUsuario.findUnique.mockResolvedValue(null);
      mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

      const result = await service.unlock(mockUser.id, conquistaSemPontos.id);

      expect(result).toBe(true);
      expect(mockPrismaService.conquistaUsuario.create).toHaveBeenCalledWith({
        data: { userId: mockUser.id, conquistaId: conquistaSemPontos.id },
      });
    });

    it('deve retornar false quando a conquista já foi desbloqueada', async () => {
      mockPrismaService.conquista.findUnique.mockResolvedValue(mockConquista);
      mockPrismaService.conquistaUsuario.findUnique.mockResolvedValue({
        userId: mockUser.id,
        conquistaId: mockConquista.id,
        desbloqueadaEm: new Date(),
      });

      const result = await service.unlock(mockUser.id, mockConquista.id);

      expect(result).toBe(false);
      expect(mockPrismaService.conquistaUsuario.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando a conquista não existe', async () => {
      mockPrismaService.conquista.findUnique.mockResolvedValue(null);

      await expect(service.unlock(mockUser.id, 999)).rejects.toThrow(NotFoundException);
      await expect(service.unlock(mockUser.id, 999)).rejects.toThrow(
        'Conquista não encontrada',
      );
    });
  });

  describe('checkAndUnlock', () => {
    beforeEach(() => {
      // Por padrão nenhum desbloqueio existente
      mockPrismaService.conquistaUsuario.findUnique.mockResolvedValue(null);
    });

    // Conquista sem pontos de recompensa para testar apenas a lógica de check
    // (sem acionar o caminho de XP/nível que requer mocks adicionais)
    const semPontos = { ...mockConquista, pontosRecompensa: 0 };

    describe('ação complete_challenge', () => {
      it('deve desbloquear conquista quando count de desafios atinge o critério', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([semPontos]);
        mockPrismaService.desafiosSubmetidos.count.mockResolvedValue(5);
        mockPrismaService.conquista.findUnique.mockResolvedValue(semPontos);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        const result = await service.checkAndUnlock(mockUser.id, 'complete_challenge');

        expect(result).toContain(semPontos.nome);
      });

      it('não deve desbloquear quando o count de desafios não atingiu o critério', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([semPontos]);
        mockPrismaService.desafiosSubmetidos.count.mockResolvedValue(0);

        const result = await service.checkAndUnlock(mockUser.id, 'complete_challenge');

        expect(result).toHaveLength(0);
        expect(mockPrismaService.conquistaUsuario.create).not.toHaveBeenCalled();
      });

      it('deve chamar desafiosSubmetidos.count com filtro userId e status SUCCESS', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([semPontos]);
        mockPrismaService.desafiosSubmetidos.count.mockResolvedValue(1);
        mockPrismaService.conquista.findUnique.mockResolvedValue(semPontos);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        await service.checkAndUnlock(mockUser.id, 'complete_challenge');

        expect(mockPrismaService.desafiosSubmetidos.count).toHaveBeenCalledWith({
          where: { userId: mockUser.id, status: 'SUCCESS' },
        });
      });

      it('deve retornar os nomes das conquistas desbloqueadas', async () => {
        const conquista2 = {
          ...semPontos,
          id: 5,
          nome: 'Eco Guerreiro',
          criterio: JSON.stringify({ type: 'desafios_completados', count: 5 }),
        };
        mockPrismaService.conquista.findMany.mockResolvedValue([semPontos, conquista2]);
        mockPrismaService.desafiosSubmetidos.count.mockResolvedValue(5);
        mockPrismaService.conquista.findUnique
          .mockResolvedValueOnce(semPontos)
          .mockResolvedValueOnce(conquista2);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        const result = await service.checkAndUnlock(mockUser.id, 'complete_challenge');

        expect(result).toContain(semPontos.nome);
        expect(result).toContain(conquista2.nome);
        expect(result).toHaveLength(2);
      });
    });

    describe('conquista já desbloqueada', () => {
      it('não deve desbloquear conquista que já foi desbloqueada — findUnique retorna registro existente', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([mockConquistaSocial]);
        // findUnique retorna registro: conquista já desbloqueada
        mockPrismaService.conquistaUsuario.findUnique.mockResolvedValue({
          userId: mockUser.id,
          conquistaId: mockConquistaSocial.id,
          desbloqueadaEm: new Date('2024-01-01'),
        });

        const result = await service.checkAndUnlock(mockUser.id, 'create_post');

        // Deve retornar array vazio — não desbloqueou nada
        expect(result).toEqual([]);
        expect(mockPrismaService.conquistaUsuario.create).not.toHaveBeenCalled();
      });
    });

    describe('ação create_post', () => {
      const socialSemPontos = { ...mockConquistaSocial, pontosRecompensa: 0 };

      it('deve desbloquear conquista de primeiro post quando postCount >= 1', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([socialSemPontos]);
        mockPrismaService.posts.count.mockResolvedValue(1);
        mockPrismaService.conquista.findUnique.mockResolvedValue(socialSemPontos);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        const result = await service.checkAndUnlock(mockUser.id, 'create_post');

        expect(result).toContain(socialSemPontos.nome);
      });

      it('não deve desbloquear quando o usuário ainda não tem posts', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([socialSemPontos]);
        mockPrismaService.posts.count.mockResolvedValue(0);

        const result = await service.checkAndUnlock(mockUser.id, 'create_post');

        expect(result).toHaveLength(0);
      });
    });

    describe('ação earn_points', () => {
      it('deve desbloquear conquista de pontos quando usuário tem pontos suficientes', async () => {
        const conquistaPontos = {
          ...mockConquista,
          id: 3,
          nome: 'Centelha Verde',
          pontosRecompensa: 0,
          criterio: JSON.stringify({ type: 'pontos_totais', amount: 50 }),
        };
        mockPrismaService.conquista.findMany.mockResolvedValue([conquistaPontos]);
        mockPrismaService.user.findUnique.mockResolvedValue({ pontos: 100 });
        mockPrismaService.conquista.findUnique.mockResolvedValue(conquistaPontos);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        const result = await service.checkAndUnlock(mockUser.id, 'earn_points');

        expect(result).toContain(conquistaPontos.nome);
      });

      it('não deve desbloquear quando pontos são insuficientes', async () => {
        const conquistaPontos = {
          ...mockConquista,
          id: 3,
          nome: 'Estrela Eco',
          criterio: JSON.stringify({ type: 'pontos_totais', amount: 500 }),
        };
        mockPrismaService.conquista.findMany.mockResolvedValue([conquistaPontos]);
        mockPrismaService.user.findUnique.mockResolvedValue({ pontos: 50 });

        const result = await service.checkAndUnlock(mockUser.id, 'earn_points');

        expect(result).toHaveLength(0);
      });
    });

    describe('ação like_post', () => {
      it('deve desbloquear conquista de primeiro like', async () => {
        const conquistaLike = {
          ...mockConquista,
          id: 4,
          nome: 'Curtidor Consciente',
          pontosRecompensa: 0,
          criterio: JSON.stringify({ type: 'social', action: 'first_like' }),
        };
        mockPrismaService.conquista.findMany.mockResolvedValue([conquistaLike]);
        mockPrismaService.conquista.findUnique.mockResolvedValue(conquistaLike);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        const result = await service.checkAndUnlock(mockUser.id, 'like_post');

        expect(result).toContain(conquistaLike.nome);
      });
    });

    describe('ação não mapeada', () => {
      it('deve retornar array vazio quando nenhuma conquista corresponde à ação', async () => {
        mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista]);

        const result = await service.checkAndUnlock(mockUser.id, 'like_post');

        expect(result).toHaveLength(0);
      });
    });

    describe('critério JSON malformado', () => {
      it('não deve lançar exceção quando o criterio está malformado — catch silencioso', async () => {
        const conquistaCriterioInvalido = {
          ...mockConquista,
          id: 99,
          nome: 'Conquista Quebrada',
          criterio: '{json_invalido:::}',
        };
        mockPrismaService.conquista.findMany.mockResolvedValue([conquistaCriterioInvalido]);

        // O serviço captura o erro internamente e continua
        await expect(
          service.checkAndUnlock(mockUser.id, 'complete_challenge'),
        ).resolves.toEqual([]);

        // Nenhum create deve ter sido chamado
        expect(mockPrismaService.conquistaUsuario.create).not.toHaveBeenCalled();
      });

      it('deve continuar processando conquistas válidas mesmo se uma tem criterio inválido', async () => {
        const conquistaInvalida = {
          ...mockConquista,
          id: 99,
          nome: 'Conquista Quebrada',
          criterio: 'INVALIDO',
        };
        const socialSemPontos = { ...mockConquistaSocial, pontosRecompensa: 0 };
        mockPrismaService.conquista.findMany.mockResolvedValue([
          conquistaInvalida,
          socialSemPontos,
        ]);
        mockPrismaService.posts.count.mockResolvedValue(2);
        mockPrismaService.conquista.findUnique.mockResolvedValue(socialSemPontos);
        mockPrismaService.conquistaUsuario.create.mockResolvedValue({});

        const result = await service.checkAndUnlock(mockUser.id, 'create_post');

        // A conquista válida deve ter sido desbloqueada; a inválida ignorada
        expect(result).toContain(socialSemPontos.nome);
        expect(result).not.toContain(conquistaInvalida.nome);
      });
    });
  });
});
