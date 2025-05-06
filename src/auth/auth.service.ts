import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // 👈 Importado aqui
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // 👈 Injetado aqui
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword, age, biografia } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('As senhas devem ser iguais');
    }

    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new BadRequestException('O email já está em uso');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
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
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      console.log('Erro ao criar usuário');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    // Gerar token
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: { id: user.id, name: user.name },
    };
  }
}