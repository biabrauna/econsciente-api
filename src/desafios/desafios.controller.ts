import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioConcluidoDto } from './dto/create-desafio-concluido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('desafios')
export class DesafiosController {
  constructor(private desafiosService: DesafiosService) {}

  @Post('desafios')
  create(@Body() createDesafioDto: CreateDesafioDto) {
    return this.desafiosService.create(createDesafioDto);
  }

  @Get('desafios')
  findAll() {
    return this.desafiosService.findAll();
  }

  @Post('desafiosConcluidos')
  createDesafioConcluido(@Body() createDesafioConcluidoDto: CreateDesafioConcluidoDto) {
    return this.desafiosService.createDesafioConcluido(createDesafioConcluidoDto);
  }

  @Get('desafios/search')
  searchDesafio(@Query('search') search: string) {
    return this.desafiosService.searchDesafio(search);
  }
}
