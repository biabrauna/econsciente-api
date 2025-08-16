import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID único do usuário' })
  id: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  name: string;

  @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário' })
  email: string;

  @ApiProperty({ example: '25', description: 'Idade do usuário' })
  age: string;

  @ApiProperty({ 
    example: 'Desenvolvedor apaixonado por sustentabilidade', 
    description: 'Biografia do usuário',
    required: false 
  })
  biografia?: string;

  @ApiProperty({ example: 150, description: 'Pontos acumulados pelo usuário' })
  pontos: number;

  @ApiProperty({ example: 42, description: 'Número de seguidores' })
  seguidores: number;

  @ApiProperty({ example: 38, description: 'Número de pessoas que o usuário segue' })
  seguindo: number;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}