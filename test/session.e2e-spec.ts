import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Session Management (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
    // Clean database before each test
    await prismaService.session.deleteMany({});
    await prismaService.user.deleteMany({});
  });

  describe('Session Creation Test', () => {
    it('should create Session in database after login', async () => {
      // Register user
      const registerDto = {
        name: 'Test User',
        email: 'test@session.com',
        password: 'password123',
        confirmPassword: 'password123',
        dataNascimento: '1998-01-01',
        biografia: 'Session test user',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Login
      const loginDto = {
        email: 'test@session.com',
        password: 'password123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      // Verify session was created in database
      const user = await prismaService.user.findUnique({
        where: { email: 'test@session.com' },
      });

      expect(user).toBeDefined();
      expect(user).not.toBeNull();

      const sessions = await prismaService.session.findMany({
        where: { userId: user!.id },
      });

      expect(sessions).toBeDefined();
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0]).toHaveProperty('sessionToken');
      expect(sessions[0]).toHaveProperty('isActive', true);
      expect(sessions[0]).toHaveProperty('userId', user!.id);
      expect(sessions[0].expiresAt).toBeInstanceOf(Date);
      expect(sessions[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Session Cleanup Test', () => {
    it('should invalidate Session after logout', async () => {
      // Register user
      const registerDto = {
        name: 'Test User',
        email: 'test@logout.com',
        password: 'password123',
        confirmPassword: 'password123',
        dataNascimento: '1998-01-01',
        biografia: 'Logout test user',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Login
      const loginDto = {
        email: 'test@logout.com',
        password: 'password123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      const token = loginResponse.body.access_token;

      // Verify session exists and is active
      const user = await prismaService.user.findUnique({
        where: { email: 'test@logout.com' },
      });

      expect(user).toBeDefined();
      expect(user).not.toBeNull();

      let sessions = await prismaService.session.findMany({
        where: { userId: user!.id },
      });

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].isActive).toBe(true);

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify session was invalidated
      sessions = await prismaService.session.findMany({
        where: { userId: user!.id },
      });

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].isActive).toBe(false);
    });
  });
});
