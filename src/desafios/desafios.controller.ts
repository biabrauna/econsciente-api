import { Controller, Post, Get, Patch, Body, Query, UseGuards, Param, Request } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiBody, ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { DesafiosService } from './desafios.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioSubmetidoDto } from './dto/create-desafio-submetido.dto';
import { UpdateSubmissaoStatusDto } from './dto/update-submissao-status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

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
  create(@Body() createDesafioDto: CreateDesafioDto) {
    return this.desafiosService.create(createDesafioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os desafios com paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de desafios' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.desafiosService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar desafios por texto' })
  @ApiQuery({ name: 'search', description: 'Termo de busca' })
  searchDesafio(@Query('search') search: string) {
    return this.desafiosService.searchDesafio(search);
  }

  @Get('submissoes')
  @ApiOperation({ summary: 'Listar todas as submissões (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'ERROR'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findSubmissoes(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.desafiosService.findSubmissoes(paginationDto, status);
  }

  @Post('submissoes')
  @ApiOperation({ summary: 'Submeter desafio para validação' })
  @ApiBody({ type: CreateDesafioSubmetidoDto })
  @ApiResponse({ status: 201, description: 'Desafio submetido — aguardando validação' })
  createDesafioSubmetido(@Body() dto: CreateDesafioSubmetidoDto) {
    return this.desafiosService.createDesafioSubmetido(dto);
  }

  @Patch('submissoes/:id/status')
  @ApiOperation({ summary: 'Aprovar ou rejeitar submissão (admin)' })
  @ApiParam({ name: 'id', description: 'ID da submissão' })
  @ApiBody({ type: UpdateSubmissaoStatusDto })
  @ApiResponse({ status: 200, description: 'Status atualizado — pontos concedidos se SUCCESS' })
  @ApiResponse({ status: 404, description: 'Submissão não encontrada' })
  @ApiResponse({ status: 400, description: 'Submissão já processada' })
  patchSubmissaoStatus(
    @Param('id') id: number,
    @Body() dto: UpdateSubmissaoStatusDto,
  ) {
    return this.desafiosService.patchSubmissaoStatus(Number(id), dto);
  }

  @Get('submissoes/me')
  @ApiOperation({ summary: 'Minhas submissões de desafios' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findMinhasSubmissoes(@Request() req: any, @Query() paginationDto: PaginationDto) {
    return this.desafiosService.findSubmissoesByUser(req.user.id, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar desafio por ID' })
  @ApiParam({ name: 'id', description: 'ID do desafio' })
  @ApiResponse({ status: 200, description: 'Desafio encontrado' })
  @ApiResponse({ status: 404, description: 'Desafio não encontrado' })
  findOne(@Param('id') id: number) {
    return this.desafiosService.findOne(id);
  }
}
