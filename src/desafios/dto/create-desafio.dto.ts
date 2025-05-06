import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDesafioDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O desafio é obrigatório' })
  desafios: string;

  @IsNumber()
  @ApiProperty()
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  valor: number;
}