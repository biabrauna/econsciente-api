import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    dataNascimento: new Date('2000-01-01'),
    biografia: 'Desenvolvedor',
    pontos: 100,
    seguidores: 10,
    seguindo: 5,
    nivel: 1,
    xp: 0,
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'hashedPassword',
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockSessionsService = {
    createSession: jest.fn().mockResolvedValue('session-token-abc'),
    invalidateAllUserSessions: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── REGISTER ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'password123',
      confirmPassword: 'password123',
      dataNascimento: '2000-01-01',
      biografia: 'Desenvolvedor',
    };

    it('registra um novo usuário com sucesso e retorna objeto sem senha', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('verifica o email antes de criar e chama create com senha hasheada', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 'salt');
      const createCall = mockPrismaService.user.create.mock.calls[0][0];
      expect(createCall.data.password).toBe('hashedPassword');
    });

    it('lança BadRequestException quando email já está em uso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('O email já está em uso'),
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    // ─── VALIDAÇÃO DE IDADE ───────────────────────────────────────────────────

    describe('validação de idade', () => {
      it('lança BadRequestException para usuário com 12 anos (menor que 13)', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const hoje = new Date();
        // Coloca aniversário exatamente 12 anos atrás + 1 dia (para ter 12 anos certos)
        const dataNasc = new Date(
          hoje.getFullYear() - 12,
          hoje.getMonth(),
          hoje.getDate() + 1,
        );
        const dto = { ...registerDto, dataNascimento: dataNasc.toISOString().split('T')[0] };

        await expect(service.register(dto)).rejects.toThrow(BadRequestException);
        await expect(service.register(dto)).rejects.toThrow(
          'Você deve ter pelo menos 13 anos para se cadastrar',
        );
      });

      it('registra com sucesso usuário que faz 13 anos hoje', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.user.create.mockResolvedValue(mockUser);
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        const hoje = new Date();
        // Aniversário exato: hoje - 13 anos → idade == 13
        const dataNasc = new Date(
          hoje.getFullYear() - 13,
          hoje.getMonth(),
          hoje.getDate(),
        );
        const dto = { ...registerDto, dataNascimento: dataNasc.toISOString().split('T')[0] };

        const result = await service.register(dto);

        expect(result).not.toHaveProperty('password');
        expect(mockPrismaService.user.create).toHaveBeenCalled();
      });

      it('lança BadRequestException para usuário com mais de 120 anos', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const hoje = new Date();
        const dataNasc = new Date(
          hoje.getFullYear() - 121,
          hoje.getMonth(),
          hoje.getDate(),
        );
        const dto = { ...registerDto, dataNascimento: dataNasc.toISOString().split('T')[0] };

        await expect(service.register(dto)).rejects.toThrow(BadRequestException);
        await expect(service.register(dto)).rejects.toThrow(
          'Data de nascimento inválida',
        );
      });

      it('lança BadRequestException para data de nascimento futura', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const dto = {
          ...registerDto,
          dataNascimento: amanha.toISOString().split('T')[0],
        };

        // Uma data futura resulta em idade negativa → < 13 → BadRequest
        await expect(service.register(dto)).rejects.toThrow(BadRequestException);
        await expect(service.register(dto)).rejects.toThrow(
          'Você deve ter pelo menos 13 anos para se cadastrar',
        );
      });

      it('leva em conta mês/dia: aniversário no próximo mês resulta em idade real de 12 anos', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const hoje = new Date();
        // Próximo mês (sem overflow de ano): se hoje for dezembro usa janeiro
        const proximoMes = hoje.getMonth() === 11 ? 0 : hoje.getMonth() + 1;
        const anoAjustado =
          hoje.getMonth() === 11
            ? hoje.getFullYear() - 13 + 1
            : hoje.getFullYear() - 13;

        // Aniversário no dia 15 do próximo mês, 13 anos atrás → ainda não completou 13 anos
        const dataNasc = new Date(anoAjustado, proximoMes, 15);
        const dto = {
          ...registerDto,
          dataNascimento: dataNasc.toISOString().split('T')[0],
        };

        await expect(service.register(dto)).rejects.toThrow(
          'Você deve ter pelo menos 13 anos para se cadastrar',
        );
      });
    });
  });

  // ─── LOGIN ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = {
      email: 'joao@email.com',
      password: 'password123',
    };

    it('faz login com sucesso e retorna access_token + user sem senha', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: expect.objectContaining({
          email: mockUser.email,
          name: mockUser.name,
          id: mockUser.id,
        }),
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('chama JwtService.sign com payload correto (sub + email)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('cria sessão via SessionsService ao fazer login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');

      expect(mockSessionsService.createSession).toHaveBeenCalledWith(
        mockUser.id,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });

    it('lança NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('lança UnauthorizedException quando senha está incorreta', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Senha inválida'),
      );
    });

    it('lança UnauthorizedException quando usuário não tem senha cadastrada (ex: OAuth)', async () => {
      const userSenSenha = { ...mockUser, password: null };
      mockPrismaService.user.findUnique.mockResolvedValue(userSenSenha);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );
    });

    it('continua o login mesmo se SessionsService falhar (degradação graciosa)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockSessionsService.createSession.mockRejectedValueOnce(
        new Error('Redis indisponível'),
      );

      // Não deve lançar exceção — falha de sessão é silenciada
      const result = await service.login(loginDto);
      expect(result).toHaveProperty('access_token', 'jwt-token');
    });
  });
});
