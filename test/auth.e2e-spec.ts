import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
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
    await prismaService.user.deleteMany({});
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: '25',
        biografia: 'Test user',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', registerDto.name);
          expect(res.body).toHaveProperty('email', registerDto.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid registration data', () => {
      const invalidDto = {
        name: 'J', // Too short
        email: 'invalid-email',
        password: 'pass',
        confirmPassword: 'different',
        age: '25',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for duplicate email', async () => {
      const registerDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: '25',
        biografia: 'Test user',
      };

      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Try to register with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('já está em uso');
        });
    });
  });

  describe('/auth/user (POST)', () => {
    beforeEach(async () => {
      // Create a test user
      const registerDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: '25',
        biografia: 'Test user',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);
    });

    it('should login user successfully', () => {
      const loginDto = {
        email: 'joao@test.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/user')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('name', 'João Silva');
        });
    });

    it('should return 404 for non-existent user', () => {
      const loginDto = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/user')
        .send(loginDto)
        .expect(404);
    });

    it('should return 401 for invalid password', () => {
      const loginDto = {
        email: 'joao@test.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/user')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get token
      const registerDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: '25',
        biografia: 'Test user',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/user')
        .send({
          email: 'joao@test.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should return user data with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'João Silva');
          expect(res.body).toHaveProperty('email', 'joao@test.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});