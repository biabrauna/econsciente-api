import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    return this.prisma.posts.create({
      data: {
        userId: createPostDto.userId,
        url: createPostDto.url,
        likes: createPostDto.likes || 0
      }
    });
  }

  async findAll() {
    return this.prisma.posts.findMany();
  }
}
