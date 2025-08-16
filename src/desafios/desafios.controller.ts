import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { DesafiosService } from './desafios.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioConcluidoDto } from './dto/create-desafio-concluido.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('desafios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('desafios')
export class DesafiosController {
  constructor(private desafiosService: DesafiosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo desafio' })
  @ApiBody({ type: CreateDesafioDto })
  @ApiResponse({ status: 201, description: 'Desafio criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  create(@Body() createDesafioDto: CreateDesafioDto) {
    return this.desafiosService.create(createDesafioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os desafios' })
  @ApiResponse({ status: 200, description: 'Lista de desafios' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findAll() {
    return this.desafiosService.findAll();
  }

  @Post('concluidos')
  @ApiOperation({ summary: 'Marcar desafio como concluído' })
  @ApiBody({ type: CreateDesafioConcluidoDto })
  @ApiResponse({ status: 201, description: 'Desafio marcado como concluído' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  createDesafioConcluido(
    @Body() createDesafioConcluidoDto: CreateDesafioConcluidoDto,
  ) {
    return this.desafiosService.createDesafioConcluido(
      createDesafioConcluidoDto,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar desafios' })
  @ApiQuery({ name: 'search', description: 'Termo de busca' })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  searchDesafio(@Query('search') search: string) {
    return this.desafiosService.searchDesafio(search);
  }
}
