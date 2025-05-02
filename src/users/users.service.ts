import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        biografia: true,
        pontos: true,
        seguidores: true,
        seguindo: true
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        biografia: true,
        pontos: true,
        seguidores: true,
        seguindo: true
      }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          biografia: true,
          pontos: true,
          seguidores: true,
          seguindo: true
        }
      });
    } catch (error) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
      return { message: 'Usuário deletado com sucesso' };
    } catch (error) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}