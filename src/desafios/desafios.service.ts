import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesafioDto } from './dto/create-desafio.dto';
import { CreateDesafioConcluidoDto } from './dto/create-desafio-concluido.dto';

@Injectable()
export class DesafiosService {
  constructor(private prisma: PrismaService) {}

  async create(createDesafioDto: CreateDesafioDto) {
    return this.prisma.desafios.create({
      data: createDesafioDto
    });
  }

  async findAll() {
    return this.prisma.desafios.findMany();
  }

  async createDesafioConcluido(createDesafioConcluidoDto: CreateDesafioConcluidoDto) {
    return this.prisma.desafiosConcluidos.create({
      data: createDesafioConcluidoDto
    });
  }

  async searchDesafio(search: string) {
    return this.prisma.desafios.findMany({
      where: {
        desafios: {
          contains: search,
          mode: 'insensitive',
        }
      }
    });
  }
}
