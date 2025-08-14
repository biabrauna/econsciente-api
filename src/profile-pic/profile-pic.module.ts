import { Module } from '@nestjs/common';
import { ProfilePicController } from './profile-pic.controller';
import { ProfilePicService } from './profile-pic.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProfilePicController],
  providers: [ProfilePicService],
})
export class ProfilePicModule {}