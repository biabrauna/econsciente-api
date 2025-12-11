import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword, dataNascimento, biografia } =
      registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('As senhas devem ser iguais');
    }

    // Check if user exists
    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new BadRequestException('O email já está em uso');
    }

    // Validar idade mínima (13 anos)
    const birthDate = new Date(dataNascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 13) {
      throw new BadRequestException('Você deve ter pelo menos 13 anos para se cadastrar');
    }

    if (actualAge > 120) {
      throw new BadRequestException('Data de nascimento inválida');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          dataNascimento: new Date(dataNascimento),
          biografia: biografia || '',
        },
      });
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Erro ao criar usuário', error);
      throw new BadRequestException('Erro ao criar usuário');
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    const payload = { sub: user.id, email: user.email };

    // Log do JWT_SECRET (apenas primeiros caracteres por segurança)
    const secret = process.env.JWT_SECRET || 'UNDEFINED';
    console.log('[AuthService] Gerando token com JWT_SECRET:', secret.substring(0, 10) + '...');

    const access_token = this.jwtService.sign(payload);
    console.log('[AuthService] Token gerado:', access_token.substring(0, 30) + '...');

    // Criar sessão no banco de dados
    try {
      await this.sessionsService.createSession(user.id, ipAddress, userAgent);
      this.logger.log(`Sessão criada para usuário ${user.email} (IP: ${ipAddress})`);
    } catch (error) {
      this.logger.error(`Erro ao criar sessão: ${error.message}`);
    }

    // Return complete user object instead of just userId and name
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async logout(userId: string) {
    try {
      await this.sessionsService.invalidateAllUserSessions(userId);
      this.logger.log(`Logout realizado para usuário ${userId}`);
      return { message: 'Logout realizado com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao fazer logout: ${error.message}`);
      throw new BadRequestException('Erro ao fazer logout');
    }
  }
}
