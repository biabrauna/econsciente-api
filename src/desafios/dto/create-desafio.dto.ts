import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateDesafioDto {
  @IsString()
  @IsNotEmpty({ message: 'O desafio é obrigatório' })
  @MinLength(10, { message: 'Descrição do desafio deve ter pelo menos 10 caracteres' })
  @MaxLength(500, { message: 'Descrição do desafio deve ter no máximo 500 caracteres' })
  @ApiProperty({ 
    example: 'Plantar uma árvore no seu bairro', 
    description: 'Descrição detalhada do desafio ambiental',
    minLength: 10,
    maxLength: 500
  })
  desafios: string;

  @IsNumber({}, { message: 'Valor deve ser um número válido' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @Min(1, { message: 'Valor deve ser no mínimo 1 ponto' })
  @Max(1000, { message: 'Valor deve ser no máximo 1000 pontos' })
  @ApiProperty({ 
    example: 50, 
    description: 'Pontos que o usuário ganha ao completar o desafio',
    minimum: 1,
    maximum: 1000
  })
  valor: number;
}