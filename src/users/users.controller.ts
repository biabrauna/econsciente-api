import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar/Buscar usuários',
    description:
      'Retorna uma lista paginada com todos os usuários cadastrados no sistema ou busca por nome, excluindo informações sensíveis como senhas.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Itens por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'João',
    description: 'Buscar usuários por nome',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              name: { type: 'string', example: 'João Silva' },
              email: { type: 'string', example: 'joao@email.com' },
              age: { type: 'number', example: 25 },
              biografia: {
                type: 'string',
                example: 'Desenvolvedor apaixonado por sustentabilidade',
              },
              pontos: { type: 'number', example: 150 },
              seguidores: { type: 'number', example: 42 },
              seguindo: { type: 'number', example: 38 },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou ausente',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  findAll(@Query() paginationDto: PaginationDto, @Query('search') search?: string) {
    return this.usersService.findAll(paginationDto, search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Retorna os dados de um usuário específico baseado no ID fornecido.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário no formato ObjectId do MongoDB',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@email.com' },
        age: { type: 'string', example: '25' },
        biografia: {
          type: 'string',
          example: 'Desenvolvedor apaixonado por sustentabilidade',
        },
        pontos: { type: 'number', example: 150 },
        seguidores: { type: 'number', example: 42 },
        seguindo: { type: 'number', example: 38 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado com o ID fornecido',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou ausente',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
