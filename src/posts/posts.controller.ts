import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';

@ApiTags('posts')
@ApiBearerAuth('JWT-auth')
@UseGuards(CombinedAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os posts' })
  @ApiResponse({ status: 200, description: 'Lista de posts' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findAll() {
    return this.postsService.findAll();
  }
}
