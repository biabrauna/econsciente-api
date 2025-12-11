import { Test, TestingModule } from '@nestjs/testing';
import { ConquistasService } from './conquistas.service';

describe('ConquistasService', () => {
  let service: ConquistasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConquistasService],
    }).compile();

    service = module.get<ConquistasService>(ConquistasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
