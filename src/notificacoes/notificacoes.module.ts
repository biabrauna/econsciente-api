import { Module } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { NotificacoesController } from './notificacoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificacoesService],
  controllers: [NotificacoesController],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
