import { Test, TestingModule } from '@nestjs/testing';
import { NotificacoesService } from './notificacoes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificacoesService', () => {
  let service: NotificacoesService;
  let prismaService: PrismaService;

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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
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

    it('should create notification without metadata when metadata is omitted', async () => {
      const dto = { userId: 42, tipo: 'seguidor', titulo: 'Novo seguidor!', mensagem: 'Alguém te seguiu' };
      mockPrismaService.notificacao.create.mockResolvedValue({ ...mockNotificacao, metadata: undefined });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledTimes(1);
    });

    it('should strip invalid metadata and create without it', async () => {
      const dto = {
        userId: 42,
        tipo: 'like',
        titulo: 'Like!',
        mensagem: 'Alguém curtiu seu post',
        metadata: '{invalid json}',
      };
      mockPrismaService.notificacao.create.mockResolvedValue({ ...mockNotificacao, metadata: undefined });

      const result = await service.create(dto);

      // metadata should have been set to undefined before persisting
      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ metadata: undefined }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('findByUser', () => {
    it('should return all notifications for a user', async () => {
      mockPrismaService.notificacao.findMany.mockResolvedValue([mockNotificacao]);

      const result = await service.findByUser(42);

      expect(result).toEqual([mockNotificacao]);
      expect(mockPrismaService.notificacao.findMany).toHaveBeenCalledWith({
        where: { userId: 42 },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should filter only unread notifications when onlyUnread is true', async () => {
      const unreadNotif = { ...mockNotificacao, lida: false };
      mockPrismaService.notificacao.findMany.mockResolvedValue([unreadNotif]);

      const result = await service.findByUser(42, true);

      expect(result).toEqual([unreadNotif]);
      expect(mockPrismaService.notificacao.findMany).toHaveBeenCalledWith({
        where: { userId: 42, lida: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when user has no notifications', async () => {
      mockPrismaService.notificacao.findMany.mockResolvedValue([]);

      const result = await service.findByUser(99);

      expect(result).toEqual([]);
    });
  });

  describe('countUnread', () => {
    it('should return count of unread notifications', async () => {
      mockPrismaService.notificacao.count.mockResolvedValue(5);

      const result = await service.countUnread(42);

      expect(result).toBe(5);
      expect(mockPrismaService.notificacao.count).toHaveBeenCalledWith({
        where: { userId: 42, lida: false },
      });
    });

    it('should return 0 when all notifications are read', async () => {
      mockPrismaService.notificacao.count.mockResolvedValue(0);

      const result = await service.countUnread(42);

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a specific notification as read for the correct user', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead(1, 42);

      expect(result).toEqual({ count: 1 });
      expect(mockPrismaService.notificacao.updateMany).toHaveBeenCalledWith({
        where: { id: 1, userId: 42 },
        data: { lida: true },
      });
    });

    it('should update 0 records when notification does not belong to user', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAsRead(1, 99);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for a user', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(42);

      expect(result).toEqual({ count: 3 });
      expect(mockPrismaService.notificacao.updateMany).toHaveBeenCalledWith({
        where: { userId: 42, lida: false },
        data: { lida: true },
      });
    });

    it('should return count 0 when there are no unread notifications', async () => {
      mockPrismaService.notificacao.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead(42);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('notifyConquista', () => {
    it('should call create with tipo conquista and correct data', async () => {
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

    it('should embed the conquista name in the message', async () => {
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      await service.notifyConquista(42, 'Eco Guerreiro', 3);

      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensagem: expect.stringContaining('Eco Guerreiro'),
        }),
      });
    });
  });

  describe('notifyNewFollower', () => {
    it('should call create with tipo seguidor and correct data', async () => {
      const mockFollowerNotif = { ...mockNotificacao, tipo: 'seguidor', titulo: 'Novo seguidor! 👥' };
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

    it('should include follower name in the message', async () => {
      mockPrismaService.notificacao.create.mockResolvedValue(mockNotificacao);

      await service.notifyNewFollower(42, 'Bob', 7);

      expect(mockPrismaService.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensagem: expect.stringContaining('Bob'),
        }),
      });
    });
  });

  describe('notifyLike', () => {
    it('should call create with tipo like and correct data', async () => {
      const mockLikeNotif = { ...mockNotificacao, tipo: 'like', titulo: 'Curtida no seu post! ❤️' };
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

    it('should include liker name in the message', async () => {
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
