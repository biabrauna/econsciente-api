import { Test, TestingModule } from '@nestjs/testing';
import { ConquistasController } from './conquistas.controller';

describe('ConquistasController', () => {
  let controller: ConquistasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConquistasController],
    }).compile();

    controller = module.get<ConquistasController>(ConquistasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
