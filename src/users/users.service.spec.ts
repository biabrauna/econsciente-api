import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';

describe('UsersService', () => {
  let service: UsersService;

  // IDs numéricos — o serviço real usa number, não string
  const mockUser = {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    dataNascimento: new Date('1999-05-10'),
    biografia: 'Desenvolvedor',
    pontos: 100,
    nivel: 2,
    xp: 200,
    seguidores: 10,
    seguindo: 5,
    createdAt: new Date('2024-01-01'),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    posts: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    desafiosSubmetidos: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    conquista: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrismaService)),
  };

  const mockConquistasService = {
    checkAndUnlock: jest.fn().mockResolvedValue([]),
  };

  const mockNotificacoesService = {
    create: jest.fn().mockResolvedValue({}),
    notifyConquista: jest.fn().mockResolvedValue({}),
  };

  const mockOnboardingService = {
    checkAndCompleteBio: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConquistasService,
          useValue: mockConquistasService,
        },
        {
          provide: NotificacoesService,
          useValue: mockNotificacoesService,
        },
        {
          provide: OnboardingService,
          useValue: mockOnboardingService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // jest.clearAllMocks() apaga implementações — restaurar $transaction a cada teste
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('deve retornar usuários paginados sem senha', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(users);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          select: expect.not.objectContaining({ password: true }),
        }),
      );
    });

    it('deve aplicar paginação corretamente na página 2', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(15);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('deve filtrar por nome quando search é fornecido', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 10 }, 'João');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({ contains: 'João' }),
          }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // findOne
  // ─────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('deve retornar usuário por id sem campo password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          select: expect.not.objectContaining({ password: true }),
        }),
      );
    });

    it('deve lançar NotFoundException quando usuário não encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(9999)).rejects.toThrow('Usuário não encontrado');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────────────────────
  describe('update', () => {
    it('deve atualizar e retornar o usuário', async () => {
      const updateDto = { name: 'João Atualizado' };
      const updatedUser = { ...mockUser, name: 'João Atualizado' };

      // findUnique para verificar bio anterior
      mockPrismaService.user.findUnique.mockResolvedValue({ biografia: 'Desenvolvedor' });
      // $transaction executa tx.user.update
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toEqual(updatedUser);
    });

    it('não deve alterar os pontos do usuário ao atualizar nome', async () => {
      const updateDto = { name: 'João Renomeado' };
      const updatedUser = { ...mockUser, name: 'João Renomeado', pontos: mockUser.pontos };

      mockPrismaService.user.findUnique.mockResolvedValue({ biografia: 'Bio existente' });
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      // Os pontos não devem ter sido incrementados por uma simples atualização de nome
      expect(result.pontos).toBe(mockUser.pontos);
      // update de pontos só deve ser chamado se houver ganho de XP (não é o caso aqui)
      expect(mockPrismaService.user.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ pontos: expect.anything() }),
        }),
      );
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update(9999, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('deve deletar usuário e retornar mensagem de sucesso', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser.id);

      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('deve lançar NotFoundException quando usuário não encontrado para deleção', async () => {
      mockPrismaService.user.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.remove(9999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // getRanking
  // ─────────────────────────────────────────────────────────────
  describe('getRanking', () => {
    it('deve retornar usuários ordenados por pontos DESC', async () => {
      const userComMaisPontos = { ...mockUser, id: 2, pontos: 500 };
      const userComMenosPontos = { ...mockUser, id: 3, pontos: 10 };
      // O Prisma já retorna na ordem correta — aqui verificamos que orderBy foi chamado certo
      mockPrismaService.user.findMany.mockResolvedValue([
        userComMaisPontos,
        mockUser,
        userComMenosPontos,
      ]);
      mockPrismaService.user.count.mockResolvedValue(3);

      const result = await service.getRanking({ page: 1, limit: 100 });

      expect(result.data[0].pontos).toBeGreaterThanOrEqual(result.data[1].pontos);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { pontos: 'desc' },
        }),
      );
    });

    it('deve incluir usuário sem pontos no resultado (pontos = 0)', async () => {
      const userSemPontos = { ...mockUser, id: 10, pontos: 0 };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser, userSemPontos]);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.getRanking({ page: 1, limit: 100 });

      expect(result.data).toHaveLength(2);
      const semPontos = result.data.find((u: any) => u.id === userSemPontos.id);
      expect(semPontos).toBeDefined();
      expect(semPontos.pontos).toBe(0);
    });

    it('deve aplicar paginação com skip e take corretos', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(200);

      await service.getRanking({ page: 2, limit: 100 });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 100, take: 100 }),
      );
    });

    it('deve retornar meta de paginação correta', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(150);

      const result = await service.getRanking({ page: 1, limit: 100 });

      expect(result.meta).toEqual({
        total: 150,
        page: 1,
        limit: 100,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('deve retornar hasNextPage false na última página', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.user.count.mockResolvedValue(100);

      const result = await service.getRanking({ page: 1, limit: 100 });

      expect(result.meta.hasNextPage).toBe(false);
    });
  });
});
