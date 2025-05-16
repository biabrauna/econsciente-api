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

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

  async login(loginDto: LoginDto, req?: any) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    // Store userId in session if req is available
    if (req && req.session) {
      req.session.userId = user.id;
    }

    return {
      message: 'Login realizado com sucesso',
      userId: user.id,
      name: user.name,
    };
  }
}
