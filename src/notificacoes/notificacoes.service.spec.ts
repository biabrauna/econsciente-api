import { Test, TestingModule } from '@nestjs/testing';
import { NotificacoesService } from './notificacoes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificacoesService', () => {
  let service: NotificacoesService;

  const mockNotificacao = {
    id: 1,
    userId: 42,
    tipo: 'conquista',
    titulo: 'Nova conquista desbloqueada! 🏆',
    mensagem: 'Parabéns! Você desbloqueou "Primeiro Passo"',
    lida: false,
    metadata: JSON.stringify({ conquistaId: 7 }),
    createdAt: new Date('2024-06-01'),
  };

  const mockPrismaService = {
    notificacao: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacoesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificacoesService>(NotificacoesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────────────────────
  describe('create', () => {
    it('deve criar uma notificação com sucesso', async () => {
      const dto = {
        userId: 42,
        tipo: 'conquista',
        titulo: 'Conquista!',
        mensagem: 'Você ganhou uma conquista',
        metadata: JSON.stringify({ conquistaId: 1 }),
      };
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      const result = await service.create(dto);

      expect(result).toEqual(mockNotificacao);
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('deve criar notificação sem metadata quando omitido', async () => {
      const dto = {
        userId: 42,
        tipo: 'seguidor',
        titulo: 'Novo seguidor!',
        mensagem: 'Alguém te seguiu',
      };
      mockPrismaService.notificacao.create.mockResolvedValue({
        ...mockNotificacao,
        metadata: undefined,
      });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledTimes(1);
    });

    it('deve ignorar metadata JSON inválido silenciosamente — não quebra o create', async () => {
      const dto = {
        userId: 42,
        tipo: 'like',
        titulo: 'Like!',
        mensagem: 'Alguém curtiu seu post',
        metadata: '{json invalido}',
      };
      mockPrismaService.notificacao.create.mockResolvedValue({
        ...mockNotificacao,
        metadata: undefined,
      });

      // Não deve lançar exceção
      await expect(service.create(dto)).resolves.toBeDefined();

      // metadata deve ser undefined antes de persistir
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ metadata: undefined }),
      });
    });

    it('deve prosseguir normalmente com metadata JSON válido', async () => {
      const validMeta = JSON.stringify({ postId: 5, likerId: 3 });
      const dto = {
        userId: 42,
        tipo: 'like',
        titulo: 'Like!',
        mensagem: 'Curtida!',
        metadata: validMeta,
      };
      mockPrismaService.notificacao.create.mockResolvedValue({
        ...mockNotificacao,
        metadata: validMeta,
      });

      await service.create(dto);

      // metadata válido deve ser preservado
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ metadata: validMeta }),
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // findByUser
  // ─────────────────────────────────────────────────────────────
  describe('findByUser', () => {
    it('deve retornar todas as notificações do usuário', async () => {
      mockPrismaService.notificacao.findMany.mockResolvedValue([mockNotificacao]);

      const result = await service.findByUser(42);

      expect(result).toEqual([mockNotificacao]);
      expect(mockPrismaService.notificacao.findMany).toHaveBeenCalledWith({
        where: { userId: 42 },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('deve filtrar apenas notificações não lidas quando onlyUnread é true', async () => {
      const naoLida = { ...mockNotificacao, lida: false };
      mockPrismaService.notificacao.findMany.mockResolvedValue([naoLida]);

      const result = await service.findByUser(42, true);

      expect(result).toEqual([naoLida]);
      expect(mockPrismaService.notificacao.findMany).toHaveBeenCalledWith({
        where: { userId: 42, lida: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('deve retornar array vazio quando usuário não tem notificações', async () => {
      mockPrismaService.notificacao.findMany.mockResolvedValue([]);

      const result = await service.findByUser(99);

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // countUnread
  // ─────────────────────────────────────────────────────────────
  describe('countUnread', () => {
    it('deve retornar contagem de notificações não lidas', async () => {
      mockPrismaService.notificacao.count.mockResolvedValue(5);

      const result = await service.countUnread(42);

      expect(result).toBe(5);
      expect(mockPrismaService.notificacao.count).toHaveBeenCalledWith({
        where: { userId: 42, lida: false },
      });
    });

    it('deve retornar 0 quando todas as notificações estão lidas', async () => {
      mockPrismaService.notificacao.count.mockResolvedValue(0);

      const result = await service.countUnread(42);

      expect(result).toBe(0);
    });

    it('deve filtrar apenas pelo userId correto', async () => {
      mockPrismaService.notificacao.count.mockResolvedValue(3);

      await service.countUnread(7);

      expect(mockPrismaService.notificacao.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId: 7 }) }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // markAsRead
  // ─────────────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('deve marcar notificação específica como lida para o usuário correto', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead(1, 42);

      expect(result).toEqual({ count: 1 });
      expect(mockPrismaService.notificacao.updateMany).toHaveBeenCalledWith({
        where: { id: 1, userId: 42 },
        data: { lida: true },
      });
    });

    it('deve retornar count 0 quando notificação não pertence ao usuário', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAsRead(1, 99);

      expect(result).toEqual({ count: 0 });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // markAllAsRead
  // ─────────────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('deve marcar todas as notificações não lidas como lidas para o usuário', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(42);

      expect(result).toEqual({ count: 3 });
      expect(mockPrismaService.notificacao.updateMany).toHaveBeenCalledWith({
        where: { userId: 42, lida: false },
        data: { lida: true },
      });
    });

    it('deve atualizar apenas notificações do userId correto — não afeta outros usuários', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 2 });

      await service.markAllAsRead(42);

      const callArgs = mockPrismaService.notificacao.updateMany.mock.calls[0][0];
      // O where deve ter userId exato — nunca sem userId
      expect(callArgs.where).toHaveProperty('userId', 42);
      expect(callArgs.where).not.toHaveProperty('userId', undefined);
    });

    it('deve retornar count 0 quando não existem notificações não lidas', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead(42);

      expect(result).toEqual({ count: 0 });
    });

    it('deve filtrar apenas por lida: false — não altera notificações já lidas', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 1 });

      await service.markAllAsRead(42);

      expect(mockPrismaService.notificacao.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ lida: false }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // notifyConquista
  // ─────────────────────────────────────────────────────────────
  describe('notifyConquista', () => {
    it('deve chamar create com tipo conquista e dados corretos', async () => {
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      const result = await service.notifyConquista(42, 'Primeiro Passo', 7);

      expect(result).toEqual(mockNotificacao);
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 42,
          tipo: 'conquista',
          metadata: JSON.stringify({ conquistaId: 7 }),
        }),
      });
    });

    it('deve incluir o nome da conquista na mensagem', async () => {
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      await service.notifyConquista(42, 'Eco Guerreiro', 3);

      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensagem: expect.stringContaining('Eco Guerreiro'),
        }),
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // notifyNewFollower
  // ─────────────────────────────────────────────────────────────
  describe('notifyNewFollower', () => {
    it('deve chamar create com tipo seguidor e dados corretos', async () => {
      const mockFollowerNotif = {
        ...mockNotificacao,
        tipo: 'seguidor',
        titulo: 'Novo seguidor! 👥',
      };
      mockPrismaService.notificacao.create.mockResolvedValue(mockFollowerNotif);

      const result = await service.notifyNewFollower(42, 'Alice', 5);

      expect(result).toEqual(mockFollowerNotif);
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 42,
          tipo: 'seguidor',
          metadata: JSON.stringify({ followerId: 5 }),
        }),
      });
    });

    it('deve incluir o nome do seguidor na mensagem', async () => {
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      await service.notifyNewFollower(42, 'Bob', 7);

      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensagem: expect.stringContaining('Bob'),
        }),
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // notifyLike
  // ─────────────────────────────────────────────────────────────
  describe('notifyLike', () => {
    it('deve chamar create com tipo like e dados corretos', async () => {
      const mockLikeNotif = {
        ...mockNotificacao,
        tipo: 'like',
        titulo: 'Curtida no seu post! ❤️',
      };
      mockPrismaService.notificacao.create.mockResolvedValue(mockLikeNotif);

      const result = await service.notifyLike(42, 'Carol', 10, 8);

      expect(result).toEqual(mockLikeNotif);
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 42,
          tipo: 'like',
          metadata: JSON.stringify({ postId: 10, likerId: 8 }),
        }),
      });
    });

    it('deve incluir o nome de quem curtiu na mensagem', async () => {
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      await service.notifyLike(42, 'Dave', 10, 9);

      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensagem: expect.stringContaining('Dave'),
        }),
      });
    });
  });
});
