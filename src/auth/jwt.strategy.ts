import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    console.log('[JwtStrategy] Inicializado com JWT_SECRET:', secret.substring(0, 10) + '...');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('[JwtStrategy] Validating token payload:', { sub: payload.sub, email: payload.email });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      console.log('[JwtStrategy] User not found for ID:', payload.sub);
      throw new UnauthorizedException('Token inválido: usuário não encontrado');
    }

    console.log('[JwtStrategy] User validated successfully:', user.id);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
