import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateDesafioSubmetidoDto {
  @IsNumber()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @ApiProperty({ example: 1 })
  userId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'O ID do desafio é obrigatório' })
  @ApiProperty({ example: 3 })
  desafioId: number;

  @IsString()
  @IsNotEmpty({ message: 'A URL da imagem é obrigatória' })
  @ApiProperty({ example: 'https://storage.example.com/proof.jpg', description: 'Foto de prova do desafio' })
  imageUrl: string;
}
