import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { ComentarioResponseDto } from './dto/comentario-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('comentarios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('comentarios')
export class ComentariosController {
  constructor(private comentariosService: ComentariosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar comentário em post' })
  @ApiBody({ type: CreateComentarioDto })
  @ApiResponse({
    status: 201,
    description: 'Comentário criado com sucesso',
    type: ComentarioResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  create(@Body() createComentarioDto: CreateComentarioDto) {
    return this.comentariosService.create(createComentarioDto);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Listar comentários de um post' })
  @ApiParam({ name: 'postId', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentários',
    type: [ComentarioResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findByPost(@Param('postId') postId: string) {
    return this.comentariosService.findByPost(postId);
  }

  @Get('post/:postId/count')
  @ApiOperation({ summary: 'Contar comentários de um post' })
  @ApiParam({ name: 'postId', description: 'ID do post' })
  @ApiResponse({ status: 200, description: 'Número de comentários' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async count(@Param('postId') postId: string) {
    const count = await this.comentariosService.count(postId);
    return { count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar comentário' })
  @ApiParam({ name: 'id', description: 'ID do comentário' })
  @ApiQuery({ name: 'userId', description: 'ID do usuário que está deletando' })
  @ApiResponse({ status: 200, description: 'Comentário deletado' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.comentariosService.remove(id, userId);
  }
}
