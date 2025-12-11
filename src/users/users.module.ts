import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ConquistasModule } from '../conquistas/conquistas.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [
    AuthModule,
    ConquistasModule,
    NotificacoesModule,
    forwardRef(() => OnboardingModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}