import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET', // use process.env.JWT_SECRET em produção
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}