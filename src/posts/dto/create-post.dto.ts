import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'A URL é obrigatória' })
  url: string;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  likes?: number;
}