import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439012', 
    description: 'ID do usuário que está criando o post' 
  })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'A URL é obrigatória' })
  @IsUrl({}, { message: 'URL deve ter um formato válido' })
  @ApiProperty({ 
    example: 'https://example.com/image.jpg', 
    description: 'URL da imagem do post' 
  })
  url: string;

  @IsNumber({}, { message: 'Likes deve ser um número válido' })
  @IsOptional()
  @ApiProperty({ 
    example: 0, 
    description: 'Número inicial de likes (padrão: 0)',
    required: false,
    default: 0
  })
  likes?: number = 0;
}