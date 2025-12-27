import { Module, forwardRef } from '@nestjs/common';
import { DesafiosController } from './desafios.controller';
import { DesafiosService } from './desafios.service';
import { AuthModule } from '../auth/auth.module';
import { ConquistasModule } from '../conquistas/conquistas.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    ConquistasModule,
    NotificacoesModule,
    PrismaModule,
    forwardRef(() => OnboardingModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [DesafiosController],
  providers: [DesafiosService],
  exports: [DesafiosService],
})
export class DesafiosModule {}