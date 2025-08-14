import { Module } from '@nestjs/common';
import { VisionController } from './vision.controller';
import { PythonVisionService } from './python-vision.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VisionController],
  providers: [PythonVisionService],
  exports: [PythonVisionService],
})
export class VisionModule {}