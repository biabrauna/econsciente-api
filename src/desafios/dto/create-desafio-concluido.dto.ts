import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDesafioConcluidoDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O ID do desafio é obrigatório' })
  desafioId: string;
}