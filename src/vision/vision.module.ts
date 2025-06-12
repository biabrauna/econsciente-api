import { Module } from '@nestjs/common';
import { VisionController } from './vision.controller';
import { PythonVisionService } from './python-vision.service';

@Module({
  controllers: [VisionController],
  providers: [PythonVisionService],
  exports: [PythonVisionService],
})
export class VisionModule {}