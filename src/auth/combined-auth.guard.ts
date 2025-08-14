import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // First try JWT authentication
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token);
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (user) {
          const { password, ...userWithoutPassword } = user;
          request.user = userWithoutPassword;
          return true;
        }
      } catch {
        // JWT validation failed, try session
      }
    }

    // Try session authentication
    const sessionUser = await this.authService.validateSession(request);
    if (sessionUser) {
      request.user = sessionUser;
      return true;
    }

    throw new UnauthorizedException(
      'Acesso negado - Token JWT ou sessão inválidos',
    );
  }
}