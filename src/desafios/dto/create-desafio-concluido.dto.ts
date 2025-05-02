import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDesafioConcluidoDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'O ID do desafio é obrigatório' })
  desafioId: string;
}