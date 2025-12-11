import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthModule } from '../auth/auth.module';
import { ConquistasModule } from '../conquistas/conquistas.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [AuthModule, ConquistasModule, NotificacoesModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}