import { Module } from '@nestjs/common';
import { VisionController } from './vision.controller';
import { PythonVisionService } from './python-vision.service';
import { ImageValidatorService } from './image-validator.service';
import { AuthModule } from '../auth/auth.module';
import { DesafiosModule } from '../desafios/desafios.module';

@Module({
  imports: [AuthModule, DesafiosModule],
  controllers: [VisionController],
  providers: [PythonVisionService, ImageValidatorService],
  exports: [PythonVisionService],
})
export class VisionModule {}