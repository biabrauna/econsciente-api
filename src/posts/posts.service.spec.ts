import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { UsersService } from '../users/users.service';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    name: 'Alice',
    email: 'alice@email.com',
    xp: 0,
    nivel: 1,
    pontos: 0,
  };

  const mockPost = {
    id: 10,
    userId: mockUser.id,
    texto: 'https://example.com/img.jpg',
    imagens: ['https://example.com/img.jpg'],
    curtidas: 0,
    createdAt: new Date('2024-06-01'),
    user: { id: mockUser.id, name: mockUser.name, email: mockUser.email },
    userLikes: [],
  };

  const mockUserLike = {
    userId: 2,
    postId: mockPost.id,
  };

  const mockPrismaService = {
    posts: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    follow: {
      findMany: jest.fn(),
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
    notifyLike: jest.fn().mockResolvedValue({}),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
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
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPostDto = {
      userId: mockUser.id,
      url: 'https://example.com/img.jpg',
      likes: 0,
    };

    it('should create a post and award 3 points to the user', async () => {
      mockPrismaService.posts.create.mockResolvedValue(mockPost);
      mockPrismaService.user.findUnique.mockResolvedValue({ xp: 0, nivel: 1 });
      mockPrismaService.user.update.mockResolvedValue({ pontos: 3, xp: 30, nivel: 1 });
      mockConquistasService.checkAndUnlock.mockResolvedValue([]);

      const result = await service.create(createPostDto);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.posts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: createPostDto.userId }),
        }),
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ pontos: { increment: 3 } }),
        }),
      );
    });

    it('should set imagens from url field in the post', async () => {
      mockPrismaService.posts.create.mockResolvedValue(mockPost);
      mockPrismaService.user.findUnique.mockResolvedValue({ xp: 0, nivel: 1 });
      mockPrismaService.user.update.mockResolvedValue({});

      await service.create(createPostDto);

      expect(mockPrismaService.posts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            imagens: [createPostDto.url],
            texto: createPostDto.url,
          }),
        }),
      );
    });

    it('should create empty imagens array when no url is provided', async () => {
      const dtoNoUrl = { userId: mockUser.id };
      mockPrismaService.posts.create.mockResolvedValue({ ...mockPost, imagens: [] });
      mockPrismaService.user.findUnique.mockResolvedValue({ xp: 0, nivel: 1 });
      mockPrismaService.user.update.mockResolvedValue({});

      await service.create(dtoNoUrl);

      expect(mockPrismaService.posts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ imagens: [] }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const posts = [mockPost];
      mockPrismaService.posts.findMany.mockResolvedValue(posts);
      mockPrismaService.posts.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(posts);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should skip records correctly for page 2', async () => {
      mockPrismaService.posts.findMany.mockResolvedValue([]);
      mockPrismaService.posts.count.mockResolvedValue(15);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(mockPrismaService.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should return correct meta when there are multiple pages', async () => {
      mockPrismaService.posts.findMany.mockResolvedValue([mockPost]);
      mockPrismaService.posts.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('likePost', () => {
    it('should like a post successfully', async () => {
      const likedPost = { ...mockPost, userLikes: [{ userId: 2 }] };
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);
      mockPrismaService.userLike.create.mockResolvedValue(mockUserLike);
      mockPrismaService.posts.findUnique.mockResolvedValue(likedPost);
      mockPrismaService.user.findUnique.mockResolvedValue({ name: 'Bob' });

      const result = await service.likePost(mockPost.id, 2);

      expect(result).toEqual(likedPost);
      expect(mockPrismaService.userLike.create).toHaveBeenCalledWith({
        data: { userId: 2, postId: mockPost.id },
      });
    });

    it('should throw Error when user already liked the post', async () => {
      mockPrismaService.userLike.findUnique.mockResolvedValue(mockUserLike);

      await expect(service.likePost(mockPost.id, 2)).rejects.toThrow(
        'Você já curtiu este post',
      );
      expect(mockPrismaService.userLike.create).not.toHaveBeenCalled();
    });

    it('should not send notification when liker is the post owner', async () => {
      const ownPost = { ...mockPost, userId: 2 };
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);
      mockPrismaService.userLike.create.mockResolvedValue({});
      mockPrismaService.posts.findUnique.mockResolvedValue(ownPost);

      await service.likePost(ownPost.id, 2);

      // notifyLike should not be called when liker === post owner
      expect(mockNotificacoesService.notifyLike).not.toHaveBeenCalled();
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post successfully', async () => {
      const unlikedPost = { ...mockPost, userLikes: [] };
      mockPrismaService.userLike.findUnique.mockResolvedValue(mockUserLike);
      mockPrismaService.userLike.delete.mockResolvedValue(mockUserLike);
      mockPrismaService.posts.findUnique.mockResolvedValue(unlikedPost);

      const result = await service.unlikePost(mockPost.id, 2);

      expect(result).toEqual(unlikedPost);
      expect(mockPrismaService.userLike.delete).toHaveBeenCalledWith({
        where: { userId_postId: { userId: 2, postId: mockPost.id } },
      });
    });

    it('should throw Error when like does not exist', async () => {
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);

      await expect(service.unlikePost(mockPost.id, 2)).rejects.toThrow(
        'Você não curtiu este post',
      );
      expect(mockPrismaService.userLike.delete).not.toHaveBeenCalled();
    });
  });

  describe('getFeed', () => {
    it('should return paginated feed with own and followed users posts', async () => {
      const followingList = [{ followingId: 3 }, { followingId: 4 }];
      mockPrismaService.follow.findMany.mockResolvedValue(followingList);
      mockPrismaService.posts.findMany.mockResolvedValue([mockPost]);
      mockPrismaService.posts.count.mockResolvedValue(1);

      const result = await service.getFeed(mockUser.id, { page: 1, limit: 10 });

      expect(result.data).toEqual([mockPost]);
      // Should include own userId (1) + followed ids (3, 4)
      expect(mockPrismaService.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: { in: expect.arrayContaining([mockUser.id, 3, 4]) },
          },
        }),
      );
    });

    it('should include own posts when user follows nobody', async () => {
      mockPrismaService.follow.findMany.mockResolvedValue([]);
      mockPrismaService.posts.findMany.mockResolvedValue([mockPost]);
      mockPrismaService.posts.count.mockResolvedValue(1);

      const result = await service.getFeed(mockUser.id, { page: 1, limit: 10 });

      expect(result.data).toEqual([mockPost]);
      expect(mockPrismaService.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: { in: [mockUser.id] } },
        }),
      );
    });

    it('should return correct pagination meta for feed', async () => {
      mockPrismaService.follow.findMany.mockResolvedValue([]);
      mockPrismaService.posts.findMany.mockResolvedValue([]);
      mockPrismaService.posts.count.mockResolvedValue(0);

      const result = await service.getFeed(mockUser.id, { page: 1, limit: 10 });

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });
});
