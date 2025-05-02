import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDesafioDto {
  @IsString()
  @IsNotEmpty({ message: 'O desafio é obrigatório' })
  desafios: string;

  @IsNumber()
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  valor: number;
}