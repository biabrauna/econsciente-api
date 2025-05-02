import { Module } from '@nestjs/common';
import { ProfilePicController } from './profile-pic.controller';
import { ProfilePicService } from './profile-pic.service';

@Module({
  controllers: [ProfilePicController],
  providers: [ProfilePicService],
})
export class ProfilePicModule {}