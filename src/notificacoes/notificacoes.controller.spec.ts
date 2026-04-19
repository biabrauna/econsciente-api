import { Test, TestingModule } from '@nestjs/testing';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';

describe('NotificacoesController', () => {
  let controller: NotificacoesController;

  const mockNotificacoesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacoesController],
      providers: [
        { provide: NotificacoesService, useValue: mockNotificacoesService },
      ],
    }).compile();

    controller = module.get<NotificacoesController>(NotificacoesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
