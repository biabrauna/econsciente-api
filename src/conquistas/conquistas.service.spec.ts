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
    desafiosConcluidos: {
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

    it('should create a conquista successfully', async () => {
      mockPrismaService.conquista.create.mockResolvedValue(mockConquista);

      const result = await service.create(createDto);

      expect(result).toEqual(mockConquista);
      expect(mockPrismaService.conquista.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ nome: createDto.nome }) }),
      );
    });

    it('should throw BadRequestException when criterio is invalid JSON', async () => {
      const invalidDto = { ...createDto, criterio: 'not-valid-json{' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Critério deve ser um JSON válido',
      );
    });

    it('should not call prisma.create when criterio is invalid', async () => {
      const invalidDto = { ...createDto, criterio: '{broken' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.conquista.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all conquistas ordered by tipo', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista, mockConquistaSocial]);

      const result = await service.findAll();

      expect(result).toEqual([mockConquista, mockConquistaSocial]);
      expect(mockPrismaService.conquista.findMany).toHaveBeenCalledWith({
        orderBy: { tipo: 'asc' },
      });
    });

    it('should return empty array when no conquistas exist', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findUserConquistas', () => {
    it('should return conquistas with desbloqueada status merged', async () => {
      const desbloqueadaEm = new Date('2024-06-01');
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista, mockConquistaSocial]);
      mockPrismaService.conquistaUsuario.findMany.mockResolvedValue([
        { conquistaId: mockConquista.id, desbloqueadaEm },
      ]);

      const result = await service.findUserConquistas(mockUser.id);

      expect(result).toHaveLength(2);
      const primeira = result.find((c) => c.id === mockConquista.id);
      const segunda = result.find((c) => c.id === mockConquistaSocial.id);

      expect(primeira.desbloqueada).toBe(true);
      expect(primeira.desbloqueadaEm).toBe(desbloqueadaEm.toISOString());
      expect(segunda.desbloqueada).toBe(false);
      expect(segunda.desbloqueadaEm).toBeUndefined();
    });

    it('should return all conquistas as locked when user has none unlocked', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista]);
      mockPrismaService.conquistaUsuario.findMany.mockResolvedValue([]);

      const result = await service.findUserConquistas(99);

      expect(result[0].desbloqueada).toBe(false);
    });
  });

  describe('unlock', () => {
    it('should unlock a conquista and return true', async () => {
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

    it('should return false when conquista is already unlocked', async () => {
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

    it('should throw NotFoundException when conquista does not exist', async () => {
      mockPrismaService.conquista.findUnique.mockResolvedValue(null);

      await expect(service.unlock(mockUser.id, 999)).rejects.toThrow(NotFoundException);
      await expect(service.unlock(mockUser.id, 999)).rejects.toThrow(
        'Conquista não encontrada',
      );
    });
  });

  describe('checkAndUnlock', () => {
    beforeEach(() => {
      // By default no existing unlock
      mockPrismaService.conquistaUsuario.findUnique.mockResolvedValue(null);
    });

    it('should unlock conquista when complete_challenge action meets count', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista]);
      mockPrismaService.desafiosConcluidos.count.mockResolvedValue(5);
      // For unlock -> conquista.findUnique then conquistaUsuario.findUnique
      mockPrismaService.conquista.findUnique.mockResolvedValue(mockConquista);
      mockPrismaService.conquistaUsuario.create.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.checkAndUnlock(mockUser.id, 'complete_challenge');

      expect(result).toContain(mockConquista.nome);
    });

    it('should not unlock when complete_challenge count is not reached', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista]);
      mockPrismaService.desafiosConcluidos.count.mockResolvedValue(0);

      const result = await service.checkAndUnlock(mockUser.id, 'complete_challenge');

      expect(result).toHaveLength(0);
    });

    it('should unlock conquista for create_post action when post count >= 1', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquistaSocial]);
      mockPrismaService.posts.count.mockResolvedValue(1);
      mockPrismaService.conquista.findUnique.mockResolvedValue(mockConquistaSocial);
      mockPrismaService.conquistaUsuario.create.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.checkAndUnlock(mockUser.id, 'create_post');

      expect(result).toContain(mockConquistaSocial.nome);
    });

    it('should return empty array when conquista already unlocked', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquistaSocial]);
      mockPrismaService.conquistaUsuario.findUnique.mockResolvedValue({
        userId: mockUser.id,
        conquistaId: mockConquistaSocial.id,
      });

      const result = await service.checkAndUnlock(mockUser.id, 'create_post');

      expect(result).toHaveLength(0);
    });

    it('should unlock for earn_points action when user has enough pontos', async () => {
      const conquistaPontos = {
        ...mockConquista,
        id: 3,
        nome: 'Centelha Verde',
        criterio: JSON.stringify({ type: 'pontos_totais', amount: 50 }),
      };
      mockPrismaService.conquista.findMany.mockResolvedValue([conquistaPontos]);
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ pontos: 100 })   // earn_points check
        .mockResolvedValueOnce(mockUser);           // unlock -> level check
      mockPrismaService.conquista.findUnique.mockResolvedValue(conquistaPontos);
      mockPrismaService.conquistaUsuario.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.checkAndUnlock(mockUser.id, 'earn_points');

      expect(result).toContain(conquistaPontos.nome);
    });

    it('should unlock for like_post action on first_like criteria', async () => {
      const conquistaLike = {
        ...mockConquista,
        id: 4,
        nome: 'Curtidor Consciente',
        criterio: JSON.stringify({ type: 'social', action: 'first_like' }),
      };
      mockPrismaService.conquista.findMany.mockResolvedValue([conquistaLike]);
      mockPrismaService.conquista.findUnique.mockResolvedValue(conquistaLike);
      mockPrismaService.conquistaUsuario.create.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.checkAndUnlock(mockUser.id, 'like_post');

      expect(result).toContain(conquistaLike.nome);
    });

    it('should return empty array when no conquistas match the action', async () => {
      mockPrismaService.conquista.findMany.mockResolvedValue([mockConquista]);

      const result = await service.checkAndUnlock(mockUser.id, 'like_post');

      expect(result).toHaveLength(0);
    });
  });
});
