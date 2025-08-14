import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword, age, biografia } =
      registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('As senhas devem ser iguais');
    }

    // Check if user exists
    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new BadRequestException('O email já está em uso');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
      // Create user
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          age,
          biografia: biografia || '',
          pontos: 0,
          seguidores: 0,
          seguindo: 0,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      console.log('Erro ao criar usuário');
    }
  }

  async login(
    loginDto: LoginDto,
    req?: { session?: { userId?: string; sessionHash?: string } },
  ) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Create session hash with password + time
    if (req && req.session) {
      const currentTime = Date.now().toString();
      const sessionData = password + currentTime;
      const sessionHash = crypto
        .createHash('sha256')
        .update(sessionData)
        .digest('hex');

      req.session.userId = user.id;
      req.session.sessionHash = sessionHash;
    }

    return {
      access_token,
      userId: user.id,
      name: user.name,
    };
  }

  async validateSession(req: {
    session?: { userId?: string; sessionHash?: string };
  }) {
    if (req.session && req.session.userId && req.session.sessionHash) {
      const user = await this.prisma.user.findUnique({
        where: { id: req.session.userId },
      });
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return null;
  }
}
