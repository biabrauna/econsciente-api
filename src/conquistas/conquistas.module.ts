import { Module } from '@nestjs/common';
import { ConquistasService } from './conquistas.service';
import { ConquistasController } from './conquistas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConquistasService],
  controllers: [ConquistasController],
  exports: [ConquistasService],
})
export class ConquistasModule {}
