import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ConquistasService } from './conquistas.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { ConquistaDto } from './dto/conquista-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('conquistas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('conquistas')
export class ConquistasController {
  constructor(private conquistasService: ConquistasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as conquistas disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de conquistas',
    type: [ConquistaDto]
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findAll() {
    return this.conquistasService.findAll();
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Listar conquistas do usuário logado com status de desbloqueio' })
  @ApiResponse({
    status: 200,
    description: 'Conquistas do usuário com status desbloqueado/bloqueado',
    type: [ConquistaDto]
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findMyConquistas(@Request() req: any) {
    return this.conquistasService.findUserConquistas(req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar conquistas de um usuário específico' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Conquistas do usuário com status desbloqueado/bloqueado',
    type: [ConquistaDto]
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findUserConquistas(@Param('userId') userId: string) {
    return this.conquistasService.findUserConquistas(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova conquista (admin)' })
  @ApiBody({ type: CreateConquistaDto })
  @ApiResponse({ status: 201, description: 'Conquista criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  create(@Body() createConquistaDto: CreateConquistaDto) {
    return this.conquistasService.create(createConquistaDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Popular conquistas iniciais (desenvolvimento)' })
  @ApiResponse({ status: 201, description: 'Conquistas criadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  seed() {
    return this.conquistasService.seedConquistas();
  }
}
