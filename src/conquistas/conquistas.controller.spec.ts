import { Test, TestingModule } from '@nestjs/testing';
import { ConquistasController } from './conquistas.controller';
import { ConquistasService } from './conquistas.service';

describe('ConquistasController', () => {
  let controller: ConquistasController;

  const mockConquistasService = {
    findAll: jest.fn(),
    findUserConquistas: jest.fn(),
    create: jest.fn(),
    unlock: jest.fn(),
    checkAndUnlock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConquistasController],
      providers: [
        { provide: ConquistasService, useValue: mockConquistasService },
      ],
    }).compile();

    controller = module.get<ConquistasController>(ConquistasController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
