import { ApiProperty } from '@nestjs/swagger';

export class DesafioResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único do desafio',
  })
  id: string;

  @ApiProperty({
    example: 'Plantar uma árvore no seu bairro',
    description: 'Descrição do desafio ambiental',
  })
  desafios: string;

  @ApiProperty({
    example: 50,
    description: 'Pontos que o usuário ganha ao completar o desafio',
  })
  valor: number;

  constructor(partial: Partial<DesafioResponseDto>) {
    Object.assign(this, partial);
  }
}

export class DesafioConcluidoResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único do desafio concluído',
  })
  id: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID do desafio que foi concluído',
  })
  desafioId: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'ID do usuário que concluiu o desafio',
  })
  userId: string;

  constructor(partial: Partial<DesafioConcluidoResponseDto>) {
    Object.assign(this, partial);
  }
}
