import { Module, forwardRef } from '@nestjs/common';
import { DesafiosController } from './desafios.controller';
import { DesafiosService } from './desafios.service';
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
  controllers: [DesafiosController],
  providers: [DesafiosService],
})
export class DesafiosModule {}