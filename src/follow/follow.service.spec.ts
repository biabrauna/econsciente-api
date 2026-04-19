import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FollowService } from './follow.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

describe('FollowService', () => {
  let service: FollowService;
  let prismaService: PrismaService;

  const mockFollower = { id: 1, name: 'Alice', email: 'alice@email.com', pontos: 50, biografia: 'Bio A' };
  const mockFollowing = { id: 2, name: 'Bob', email: 'bob@email.com', pontos: 80, biografia: 'Bio B' };

  const mockFollow = {
    id: 10,
    followerId: mockFollower.id,
    followingId: mockFollowing.id,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    conquista: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrismaService)),
  };

  const mockNotificacoesService = {
    notifyNewFollower: jest.fn().mockResolvedValue(undefined),
    notifyConquista: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificacoesService,
          useValue: mockNotificacoesService,
        },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('follow', () => {
    it('should follow a user successfully', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockFollowing)   // userToFollow
        .mockResolvedValueOnce(mockFollower);   // follower (for notification)
      mockPrismaService.follow.findUnique.mockResolvedValue(null);
      mockPrismaService.follow.create.mockResolvedValue(mockFollow);
      mockPrismaService.user.update.mockResolvedValue({});
      mockNotificacoesService.notifyNewFollower.mockResolvedValue(undefined);

      const result = await service.follow(mockFollower.id, mockFollowing.id);

      expect(result).toEqual(mockFollow);
      expect(mockPrismaService.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: mockFollower.id,
            followingId: mockFollowing.id,
          },
        },
      });
      expect(mockPrismaService.follow.create).toHaveBeenCalledWith({
        data: { followerId: mockFollower.id, followingId: mockFollowing.id },
      });
    });

    it('should throw BadRequestException when following oneself', async () => {
      await expect(service.follow(1, 1)).rejects.toThrow(BadRequestException);
      await expect(service.follow(1, 1)).rejects.toThrow(
        'Você não pode seguir a si mesmo',
      );
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.follow(1, 99)).rejects.toThrow(NotFoundException);
      await expect(service.follow(1, 99)).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw BadRequestException when already following', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockFollowing);
      mockPrismaService.follow.findUnique.mockResolvedValue(mockFollow);

      await expect(service.follow(mockFollower.id, mockFollowing.id)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.follow(mockFollower.id, mockFollowing.id)).rejects.toThrow(
        'Você já segue este usuário',
      );
    });
  });

  describe('unfollow', () => {
    it('should unfollow a user successfully', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue(mockFollow);
      mockPrismaService.follow.delete.mockResolvedValue(mockFollow);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.unfollow(mockFollower.id, mockFollowing.id);

      expect(result).toEqual({ message: 'Deixou de seguir com sucesso' });
      expect(mockPrismaService.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: mockFollower.id,
            followingId: mockFollowing.id,
          },
        },
      });
    });

    it('should throw BadRequestException when not following', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue(null);

      await expect(service.unfollow(1, 2)).rejects.toThrow(BadRequestException);
      await expect(service.unfollow(1, 2)).rejects.toThrow('Você não segue este usuário');
    });

    it('should decrement counters for both users on unfollow', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue(mockFollow);
      mockPrismaService.follow.delete.mockResolvedValue(mockFollow);
      mockPrismaService.user.update.mockResolvedValue({});

      await service.unfollow(mockFollower.id, mockFollowing.id);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockFollower.id } }),
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockFollowing.id } }),
      );
    });
  });

  describe('isFollowing', () => {
    it('should return true when a follow relationship exists', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue(mockFollow);

      const result = await service.isFollowing(mockFollower.id, mockFollowing.id);

      expect(result).toBe(true);
    });

    it('should return false when no follow relationship exists', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue(null);

      const result = await service.isFollowing(mockFollower.id, mockFollowing.id);

      expect(result).toBe(false);
    });

    it('should return false immediately when followerId equals followingId', async () => {
      const result = await service.isFollowing(1, 1);

      expect(result).toBe(false);
      expect(mockPrismaService.follow.findUnique).not.toHaveBeenCalled();
    });

    it('should return false when prisma throws an error', async () => {
      mockPrismaService.follow.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await service.isFollowing(1, 2);

      expect(result).toBe(false);
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const follows = [{ followerId: 3, followingId: mockFollowing.id, createdAt: new Date() }];
      const followerUsers = [{ id: 3, name: 'Carol', email: 'carol@email.com', pontos: 20, biografia: '' }];

      mockPrismaService.follow.findMany.mockResolvedValue(follows);
      mockPrismaService.user.findMany.mockResolvedValue(followerUsers);

      const result = await service.getFollowers(mockFollowing.id);

      expect(result).toEqual(followerUsers);
      expect(mockPrismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: mockFollowing.id },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no followers', async () => {
      mockPrismaService.follow.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getFollowers(99);

      expect(result).toEqual([]);
    });

    it('should return empty array when prisma throws an error', async () => {
      mockPrismaService.follow.findMany.mockRejectedValue(new Error('DB error'));

      const result = await service.getFollowers(1);

      expect(result).toEqual([]);
    });
  });

  describe('getFollowing', () => {
    it('should return list of users being followed', async () => {
      const follows = [{ followerId: mockFollower.id, followingId: 5, createdAt: new Date() }];
      const followingUsers = [{ id: 5, name: 'Dave', email: 'dave@email.com', pontos: 60, biografia: '' }];

      mockPrismaService.follow.findMany.mockResolvedValue(follows);
      mockPrismaService.user.findMany.mockResolvedValue(followingUsers);

      const result = await service.getFollowing(mockFollower.id);

      expect(result).toEqual(followingUsers);
      expect(mockPrismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: mockFollower.id },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user follows nobody', async () => {
      mockPrismaService.follow.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getFollowing(1);

      expect(result).toEqual([]);
    });

    it('should return empty array when prisma throws an error', async () => {
      mockPrismaService.follow.findMany.mockRejectedValue(new Error('DB error'));

      const result = await service.getFollowing(1);

      expect(result).toEqual([]);
    });
  });
});
