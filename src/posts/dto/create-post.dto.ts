import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'A URL é obrigatória' })
  url: string;

  @IsNumber()
  @IsOptional()
  likes?: number;
}