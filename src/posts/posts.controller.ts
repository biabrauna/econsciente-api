import { Controller, Post, Get, Body, UseGuards, Query, Param, Patch } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('posts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Listar todos os posts com paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Itens por página' })
  @ApiResponse({ status: 200, description: 'Lista paginada de posts' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.postsService.findAll(paginationDto);
  }

  @Patch(':postId/like')
  @ApiOperation({ summary: 'Curtir um post' })
  @ApiParam({ name: 'postId', description: 'ID do post' })
  @ApiBody({ type: LikePostDto })
  @ApiResponse({ status: 200, description: 'Post curtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  likePost(@Param('postId') postId: string, @Body() likePostDto: LikePostDto) {
    return this.postsService.likePost(postId, likePostDto.userId);
  }

  @Patch(':postId/unlike')
  @ApiOperation({ summary: 'Descurtir um post' })
  @ApiParam({ name: 'postId', description: 'ID do post' })
  @ApiResponse({ status: 200, description: 'Like removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  unlikePost(@Param('postId') postId: string) {
    return this.postsService.unlikePost(postId);
  }
}
