import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilePicDto } from './dto/create-profile-pic.dto';

@Injectable()
export class ProfilePicService {
  constructor(private prisma: PrismaService) {}

  async create(createProfilePicDto: CreateProfilePicDto) {
    return this.prisma.profilePic.create({
      data: createProfilePicDto
    });
  }

  async findAll() {
    return this.prisma.profilePic.findMany();
  }
}
