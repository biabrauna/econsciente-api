import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Vision Endpoint Test', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: number;
  let desafioId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database
    await prismaService.desafiosConcluidos.deleteMany({});
    await prismaService.desafios.deleteMany({});
    await prismaService.user.deleteMany({});

    // Create test user and login
    const registerDto = {
      name: 'Test User',
      email: 'test@vision.com',
      password: 'password123',
      confirmPassword: 'password123',
      dataNascimento: '1998-01-01',
      biografia: 'Test user for vision',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@vision.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;

    // Create a test challenge
    const desafio = await prismaService.desafios.create({
      data: {
        desafios: 'Coletar 10 tampinhas de garrafa PET',
        valor: 50,
      },
    });

    desafioId = desafio.id;
  });

  describe('/vision/verify-challenge (POST)', () => {
    it('should verify challenge with fallback mode when no API keys configured', async () => {
      const verifyDto = {
        imageUrl: 'https://picsum.photos/200/300',
        challengeDescription: 'Coletar 10 tampinhas de garrafa PET',
        challengeId: desafioId,
        userId: userId,
        useSimulation: true,
      };

      const response = await request(app.getHttpServer())
        .post('/vision/verify-challenge')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyDto)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.provider).toBe('Fallback Simulado');
      expect(response.body.confidence).toBe(0.75);
      expect(response.body.analysis).toContain('MODO DESENVOLVIMENTO');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.challengeCompletedId).toBeDefined();
      expect(response.body.pointsAwarded).toBe(50);
    });

    it('should reject invalid image URL', async () => {
      const verifyDto = {
        imageUrl: 'not-a-valid-url',
        challengeDescription: 'Coletar tampinhas',
        challengeId: desafioId,
        userId: userId,
      };

      await request(app.getHttpServer())
        .post('/vision/verify-challenge')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyDto)
        .expect(400);
    });

    it('should reject missing required fields', async () => {
      const verifyDto = {
        imageUrl: 'https://picsum.photos/200/300',
        // Missing challengeDescription
        challengeId: desafioId,
        userId: userId,
      };

      await request(app.getHttpServer())
        .post('/vision/verify-challenge')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      const verifyDto = {
        imageUrl: 'https://picsum.photos/200/300',
        challengeDescription: 'Coletar tampinhas',
        challengeId: desafioId,
        userId: userId,
        useSimulation: true,
      };

      await request(app.getHttpServer())
        .post('/vision/verify-challenge')
        .send(verifyDto)
        .expect(401);
    });

    it('should work in fallback mode even without explicit useSimulation flag', async () => {
      const verifyDto = {
        imageUrl: 'https://picsum.photos/200/300',
        challengeDescription: 'Separar lixo reciclável',
        challengeId: desafioId,
        userId: userId,
        // useSimulation not set - should auto-detect no API keys
      };

      const response = await request(app.getHttpServer())
        .post('/vision/verify-challenge')
        .set('Authorization', `Bearer ${authToken}`)
        .send(verifyDto)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.provider).toBe('Fallback Simulado');
      expect(response.body.confidence).toBe(0.75);
    });
  });
});
