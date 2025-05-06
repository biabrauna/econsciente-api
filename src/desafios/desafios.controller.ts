import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioConcluidoDto } from './dto/create-desafio-concluido.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller()
export class DesafiosController {
  constructor(private desafiosService: DesafiosService) {}

  @Post('desafios')
  @UseGuards(JwtAuthGuard)
  create(@Body() createDesafioDto: CreateDesafioDto) {
    return this.desafiosService.create(createDesafioDto);
  }

  @Get('desafios')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.desafiosService.findAll();
  }

  @Post('desafiosConcluidos')
  @UseGuards(JwtAuthGuard)
  createDesafioConcluido(@Body() createDesafioConcluidoDto: CreateDesafioConcluidoDto) {
    return this.desafiosService.createDesafioConcluido(createDesafioConcluidoDto);
  }
}
