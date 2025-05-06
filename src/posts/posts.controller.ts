import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.postsService.findAll();
  }
}
