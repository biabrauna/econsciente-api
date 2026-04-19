import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { UsersService } from '../users/users.service';

describe('PostsService', () => {
  let service: PostsService;

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

    // jest.clearAllMocks() apaga implementações — restaurar $transaction a cada teste
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────────────────────
  describe('create', () => {
    const createPostDto = {
      userId: mockUser.id,
      url: 'https://example.com/img.jpg',
      likes: 0,
    };

    it('deve criar post e conceder 3 pontos ao usuário', async () => {
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

    it('deve persistir o userId correto no post criado', async () => {
      mockPrismaService.posts.create.mockResolvedValue(mockPost);
      mockPrismaService.user.findUnique.mockResolvedValue({ xp: 0, nivel: 1 });
      mockPrismaService.user.update.mockResolvedValue({});

      await service.create(createPostDto);

      const createCall = mockPrismaService.posts.create.mock.calls[0][0];
      expect(createCall.data.userId).toBe(mockUser.id);
    });

    it('deve usar url como imagens e texto do post', async () => {
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

    it('deve criar imagens como array vazio quando url é string vazia', async () => {
      // url é campo obrigatório no DTO; quando enviada vazia o serviço usa array []
      const dtoUrlVazia = { userId: mockUser.id, url: '' };
      mockPrismaService.posts.create.mockResolvedValue({ ...mockPost, imagens: [] });
      mockPrismaService.user.findUnique.mockResolvedValue({ xp: 0, nivel: 1 });
      mockPrismaService.user.update.mockResolvedValue({});

      await service.create(dtoUrlVazia);

      expect(mockPrismaService.posts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ imagens: [] }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('deve retornar posts paginados', async () => {
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

    it('deve aplicar skip correto na página 2', async () => {
      mockPrismaService.posts.findMany.mockResolvedValue([]);
      mockPrismaService.posts.count.mockResolvedValue(15);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(mockPrismaService.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('deve retornar meta correta com múltiplas páginas', async () => {
      mockPrismaService.posts.findMany.mockResolvedValue([mockPost]);
      mockPrismaService.posts.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('deve chamar posts.count sem filtro de userId em findAll global', async () => {
      mockPrismaService.posts.findMany.mockResolvedValue([]);
      mockPrismaService.posts.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 });

      // count global — sem where
      expect(mockPrismaService.posts.count).toHaveBeenCalledWith();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // likePost
  // ─────────────────────────────────────────────────────────────
  describe('likePost', () => {
    it('deve curtir um post com sucesso', async () => {
      const postCurtido = { ...mockPost, userLikes: [{ userId: 2 }] };
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);
      mockPrismaService.userLike.create.mockResolvedValue(mockUserLike);
      mockPrismaService.posts.findUnique.mockResolvedValue(postCurtido);
      mockPrismaService.user.findUnique.mockResolvedValue({ name: 'Bob' });

      const result = await service.likePost(mockPost.id, 2);

      expect(result).toEqual(postCurtido);
      expect(mockPrismaService.userLike.create).toHaveBeenCalledWith({
        data: { userId: 2, postId: mockPost.id },
      });
    });

    it('deve fazer upsert seguro — não duplica curtida existente', async () => {
      // findUnique retorna like já existente → deve lançar e NÃO chamar create novamente
      mockPrismaService.userLike.findUnique.mockResolvedValue(mockUserLike);

      await expect(service.likePost(mockPost.id, 2)).rejects.toThrow(
        'Você já curtiu este post',
      );
      expect(mockPrismaService.userLike.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro com mensagem correta quando post já foi curtido', async () => {
      mockPrismaService.userLike.findUnique.mockResolvedValue(mockUserLike);

      await expect(service.likePost(mockPost.id, 2)).rejects.toThrow(BadRequestException);
    });

    it('não deve enviar notificação quando quem curte é o dono do post', async () => {
      const postPropio = { ...mockPost, userId: 2 };
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);
      mockPrismaService.userLike.create.mockResolvedValue({});
      mockPrismaService.posts.findUnique.mockResolvedValue(postPropio);

      await service.likePost(postPropio.id, 2);

      expect(mockNotificacoesService.notifyLike).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // unlikePost
  // ─────────────────────────────────────────────────────────────
  describe('unlikePost', () => {
    it('deve remover curtida com sucesso', async () => {
      const postSemCurtida = { ...mockPost, userLikes: [] };
      mockPrismaService.userLike.findUnique.mockResolvedValue(mockUserLike);
      mockPrismaService.userLike.delete.mockResolvedValue(mockUserLike);
      mockPrismaService.posts.findUnique.mockResolvedValue(postSemCurtida);

      const result = await service.unlikePost(mockPost.id, 2);

      expect(result).toEqual(postSemCurtida);
      expect(mockPrismaService.userLike.delete).toHaveBeenCalledWith({
        where: { userId_postId: { userId: 2, postId: mockPost.id } },
      });
    });

    it('deve deletar o registro correto usando chave composta userId_postId', async () => {
      mockPrismaService.userLike.findUnique.mockResolvedValue(mockUserLike);
      mockPrismaService.userLike.delete.mockResolvedValue(mockUserLike);
      mockPrismaService.posts.findUnique.mockResolvedValue({ ...mockPost, userLikes: [] });

      await service.unlikePost(mockPost.id, 2);

      expect(mockPrismaService.userLike.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_postId: {
              userId: 2,
              postId: mockPost.id,
            },
          },
        }),
      );
    });

    it('deve lançar erro quando curtida não existe', async () => {
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);

      await expect(service.unlikePost(mockPost.id, 2)).rejects.toThrow(
        'Você não curtiu este post',
      );
      expect(mockPrismaService.userLike.delete).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando curtida não existe', async () => {
      mockPrismaService.userLike.findUnique.mockResolvedValue(null);

      await expect(service.unlikePost(mockPost.id, 2)).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // getFeed
  // ─────────────────────────────────────────────────────────────
  describe('getFeed', () => {
    it('deve retornar feed paginado com posts próprios e de seguidos', async () => {
      const followingList = [{ followingId: 3 }, { followingId: 4 }];
      mockPrismaService.follow.findMany.mockResolvedValue(followingList);
      mockPrismaService.posts.findMany.mockResolvedValue([mockPost]);
      mockPrismaService.posts.count.mockResolvedValue(1);

      const result = await service.getFeed(mockUser.id, { page: 1, limit: 10 });

      expect(result.data).toEqual([mockPost]);
      expect(mockPrismaService.posts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: { in: expect.arrayContaining([mockUser.id, 3, 4]) },
          },
        }),
      );
    });

    it('deve incluir posts próprios quando usuário não segue ninguém', async () => {
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

    it('deve retornar meta de paginação correta para feed vazio', async () => {
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
