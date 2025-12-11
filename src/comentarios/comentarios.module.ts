import { Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [PrismaModule, NotificacoesModule],
  providers: [ComentariosService],
  controllers: [ComentariosController],
  exports: [ComentariosService],
})
export class ComentariosModule {}
