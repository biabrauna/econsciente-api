import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ProfilePicService } from './profile-pic.service';
import { CreateProfilePicDto } from './dto/create-profile-pic.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('profilePic')
export class ProfilePicController {
  constructor(private profilePicService: ProfilePicService) {}

  @Post()
  create(@Body() createProfilePicDto: CreateProfilePicDto) {
    return this.profilePicService.create(createProfilePicDto);
  }

  @Get()
  findAll() {
    return this.profilePicService.findAll();
  }
}
