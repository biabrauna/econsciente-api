import { Module, forwardRef } from '@nestjs/common';
import { ProfilePicController } from './profile-pic.controller';
import { ProfilePicService } from './profile-pic.service';
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
  controllers: [ProfilePicController],
  providers: [ProfilePicService],
})
export class ProfilePicModule {}