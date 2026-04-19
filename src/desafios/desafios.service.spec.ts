import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { DesafiosService } from './desafios.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConquistasService } from '../conquistas/conquistas.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { UsersService } from '../users/users.service';
import { SubmissaoStatusDto } from './dto/update-submissao-status.dto';

// ─── Mock do helper de pontos (fora do módulo NestJS) ─────────────────────────
jest.mock('../common/helpers/points.helper', () => ({
  awardPointsAndXp: jest.fn().mockResolvedValue({
    novoXp: 700,
    novoNivel: 1,
    subiuNivel: false,
  }),
}));

import { awardPointsAndXp } from '../common/helpers/points.helper';

// ─── Dados de mock reutilizáveis ───────────────────────────────────────────────
const mockDesafio = {
  id: 1,
  desafios: 'Separe e recicle plásticos',
  valor: 70,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: 42,
  name: 'Ana Beatriz',
  email: 'ana@test.com',
  nivel: 1,
  xp: 0,
};

const mockSubmissao = {
  id: 10,
  userId: 42,
  desafioId: 1,
  desafioTitulo: 'Separe e recicle plásticos',
  desafioValor: 70,
  imageUrl: 'https://storage.example.com/proof.jpg',
  status: 'PENDING',
  submittedAt: new Date(),
  desafio: mockDesafio,
  user: { id: 42, name: 'Ana Beatriz' },
};

describe('DesafiosService', () => {
  let service: DesafiosService;

  const mockPrisma = {
    desafios: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    desafiosSubmetidos: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    conquista: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockConquistasService = {
    checkAndUnlock: jest.fn().mockResolvedValue([]),
  };

  const mockNotificacoesService = {
    create: jest.fn(),
    notifyConquista: jest.fn(),
  };

  const mockOnboardingService = {
    checkAndCompleteFirstChallenge: jest.fn().mockResolvedValue(undefined),
  };

  const mockUsersService = {};

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesafiosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConquistasService, useValue: mockConquistasService },
        { provide: NotificacoesService, useValue: mockNotificacoesService },
        { provide: OnboardingService, useValue: mockOnboardingService },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: getQueueToken('challenge-validations'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<DesafiosService>(DesafiosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── createDesafioSubmetido ────────────────────────────────────────────────

  describe('createDesafioSubmetido', () => {
    const dto = {
      userId: 42,
      desafioId: 1,
      imageUrl: 'https://storage.example.com/proof.jpg',
    };

    beforeEach(() => {
      mockPrisma.desafios.findUnique.mockResolvedValue(mockDesafio);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 42, name: 'Ana Beatriz' });
      mockPrisma.desafiosSubmetidos.create.mockResolvedValue(mockSubmissao);
    });

    it('cria submissão com status PENDING e retorna a submissão criada', async () => {
      const result = await service.createDesafioSubmetido(dto);

      expect(result.status).toBe('PENDING');
      expect(mockPrisma.desafiosSubmetidos.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });

    it('enfileira job no Redis com jobId correto e todos os campos obrigatórios', async () => {
      await service.createDesafioSubmetido(dto);

      expect(mockQueue.add).toHaveBeenCalledTimes(1);

      const [jobName, jobPayload, jobOptions] = mockQueue.add.mock.calls[0];

      expect(jobName).toBe('validate');
      expect(jobOptions).toMatchObject({
        jobId: `submissao-${mockSubmissao.id}`,
        removeOnComplete: false,
        removeOnFail: false,
      });

      // Todos os campos do payload ChallengeValidationJob devem estar presentes
      expect(jobPayload).toMatchObject({
        submissaoId: mockSubmissao.id,
        userId: mockUser.id,
        userName: mockUser.name,
        desafioId: mockDesafio.id,
        desafioTitle: mockSubmissao.desafioTitulo,
        imageUrl: dto.imageUrl,
        pontos: mockSubmissao.desafioValor,
      });
      expect(typeof jobPayload.submittedAt).toBe('string'); // ISO string
    });

    it('lança NotFoundException quando desafioId não existe', async () => {
      mockPrisma.desafios.findUnique.mockResolvedValue(null);

      await expect(service.createDesafioSubmetido(dto)).rejects.toThrow(
        new NotFoundException('Desafio não encontrado'),
      );
      expect(mockPrisma.desafiosSubmetidos.create).not.toHaveBeenCalled();
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando userId não existe', async () => {
      mockPrisma.desafios.findUnique.mockResolvedValue(mockDesafio);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createDesafioSubmetido(dto)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
      expect(mockPrisma.desafiosSubmetidos.create).not.toHaveBeenCalled();
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  // ─── patchSubmissaoStatus — SUCCESS ───────────────────────────────────────

  describe('patchSubmissaoStatus — SUCCESS', () => {
    const dto = { status: SubmissaoStatusDto.SUCCESS };

    beforeEach(() => {
      mockPrisma.desafiosSubmetidos.findUnique.mockResolvedValue(mockSubmissao);
      mockPrisma.desafiosSubmetidos.update.mockResolvedValue({
        ...mockSubmissao,
        status: 'SUCCESS',
      });
      // $transaction executa o callback imediatamente com um tx fake
      mockPrisma.$transaction.mockImplementation((cb: (tx: any) => any) =>
        cb(mockPrisma),
      );
    });

    it('executa awardPointsAndXp dentro de $transaction', async () => {
      await service.patchSubmissaoStatus(10, dto);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(awardPointsAndXp).toHaveBeenCalledWith(
        expect.anything(), // tx
        mockSubmissao.userId,
        mockSubmissao.desafioValor,
      );
    });

    it('cria notificação de desafio_aprovado com userId, titulo e mensagem corretos', async () => {
      await service.patchSubmissaoStatus(10, dto);

      expect(mockNotificacoesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockSubmissao.userId,
          tipo: 'desafio_aprovado',
          titulo: expect.stringContaining('aprovado'),
          mensagem: expect.stringContaining(mockSubmissao.desafioTitulo),
        }),
      );
    });

    it('cria notificação adicional de level_up quando subiuNivel = true', async () => {
      (awardPointsAndXp as jest.Mock).mockResolvedValueOnce({
        novoXp: 1000,
        novoNivel: 2,
        subiuNivel: true,
      });

      await service.patchSubmissaoStatus(10, dto);

      // Aguarda a Promise .then() de checkAndUnlock ser resolvida
      await Promise.resolve();

      const calls = (mockNotificacoesService.create as jest.Mock).mock.calls;
      const tiposCriados = calls.map((c) => c[0].tipo);
      expect(tiposCriados).toContain('level_up');
    });

    it('NÃO cria notificação de level_up quando subiuNivel = false', async () => {
      (awardPointsAndXp as jest.Mock).mockResolvedValueOnce({
        novoXp: 700,
        novoNivel: 1,
        subiuNivel: false,
      });

      await service.patchSubmissaoStatus(10, dto);

      await Promise.resolve();

      const calls = (mockNotificacoesService.create as jest.Mock).mock.calls;
      const tiposCriados = calls.map((c) => c[0].tipo);
      expect(tiposCriados).not.toContain('level_up');
    });

    it('chama checkAndUnlock com userId e trigger "complete_challenge"', async () => {
      await service.patchSubmissaoStatus(10, dto);

      // checkAndUnlock é fire-and-forget, aguarda a microtask
      await Promise.resolve();

      expect(mockConquistasService.checkAndUnlock).toHaveBeenCalledWith(
        mockSubmissao.userId,
        'complete_challenge',
      );
    });

    it('lança NotFoundException quando submissão não existe', async () => {
      mockPrisma.desafiosSubmetidos.findUnique.mockResolvedValue(null);

      await expect(service.patchSubmissaoStatus(999, dto)).rejects.toThrow(
        new NotFoundException('Submissão não encontrada'),
      );
    });

    it('lança BadRequestException quando submissão já não está PENDING (ex: já aprovada)', async () => {
      mockPrisma.desafiosSubmetidos.findUnique.mockResolvedValue({
        ...mockSubmissao,
        status: 'SUCCESS',
      });

      await expect(service.patchSubmissaoStatus(10, dto)).rejects.toThrow(
        new BadRequestException(
          'Só é possível alterar submissões com status PENDING',
        ),
      );
    });
  });

  // ─── patchSubmissaoStatus — ERROR ─────────────────────────────────────────

  describe('patchSubmissaoStatus — ERROR', () => {
    const dto = { status: SubmissaoStatusDto.ERROR };

    beforeEach(() => {
      mockPrisma.desafiosSubmetidos.findUnique.mockResolvedValue(mockSubmissao);
      mockPrisma.desafiosSubmetidos.update.mockResolvedValue({
        ...mockSubmissao,
        status: 'ERROR',
      });
    });

    it('cria notificação de desafio_rejeitado com userId e mensagem corretos', async () => {
      await service.patchSubmissaoStatus(10, dto);

      expect(mockNotificacoesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockSubmissao.userId,
          tipo: 'desafio_rejeitado',
          titulo: expect.stringContaining('rejeitada'),
          mensagem: expect.stringContaining(mockSubmissao.desafioTitulo),
        }),
      );
    });

    it('NÃO chama awardPointsAndXp quando submissão é rejeitada', async () => {
      await service.patchSubmissaoStatus(10, dto);

      expect(awardPointsAndXp).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('NÃO cria notificação de desafio_aprovado quando status é ERROR', async () => {
      await service.patchSubmissaoStatus(10, dto);

      const calls = (mockNotificacoesService.create as jest.Mock).mock.calls;
      const tiposCriados = calls.map((c) => c[0].tipo);
      expect(tiposCriados).not.toContain('desafio_aprovado');
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('retorna estrutura paginada com data, meta.total, meta.totalPages, meta.hasNextPage', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([mockDesafio]);
      mockPrisma.desafios.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(1);
      expect(result.meta).toMatchObject({
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('hasNextPage = false quando está na última página', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([mockDesafio]);
      mockPrisma.desafios.count.mockResolvedValue(10);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.totalPages).toBe(1);
    });

    it('calcula skip corretamente baseado em page e limit', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([]);
      mockPrisma.desafios.count.mockResolvedValue(50);

      await service.findAll({ page: 3, limit: 10 });

      expect(mockPrisma.desafios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('hasPreviousPage = true quando não está na primeira página', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([mockDesafio]);
      mockPrisma.desafios.count.mockResolvedValue(30);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  // ─── searchDesafio ────────────────────────────────────────────────────────

  describe('searchDesafio', () => {
    it('passa filtro insensitive ao prisma com o termo de busca', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([mockDesafio]);

      const result = await service.searchDesafio('plástico');

      expect(mockPrisma.desafios.findMany).toHaveBeenCalledWith({
        where: {
          desafios: { contains: 'plástico', mode: 'insensitive' },
        },
      });
      expect(result).toContain(mockDesafio);
    });

    it('retorna array vazio quando nenhum desafio corresponde ao termo', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([]);

      const result = await service.searchDesafio('termo-inexistente-xyz');

      expect(result).toEqual([]);
    });

    it('busca é case-insensitive (modo insensitive repassado ao prisma)', async () => {
      mockPrisma.desafios.findMany.mockResolvedValue([mockDesafio]);

      await service.searchDesafio('PLÁSTICO');

      const callArg = mockPrisma.desafios.findMany.mock.calls[0][0];
      expect(callArg.where.desafios.mode).toBe('insensitive');
    });
  });
});
