import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PrismaService],
  exports: [AuthService, JwtAuthGuard, JwtModule],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-for-build-only',
      signOptions: { expiresIn: '30d' }, // Token JWT válido por 30 dias
    }),
    forwardRef(() => SessionsModule),
  ],
})
export class AuthModule {}
