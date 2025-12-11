import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do post é obrigatório' })
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do post',
  })
  postId: string;

  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID do usuário que comentou',
  })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do usuário é obrigatório' })
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do usuário',
  })
  userName: string;

  @IsString()
  @IsNotEmpty({ message: 'O texto do comentário é obrigatório' })
  @MaxLength(500, { message: 'Comentário deve ter no máximo 500 caracteres' })
  @ApiProperty({
    example: 'Parabéns pela iniciativa sustentável!',
    description: 'Texto do comentário',
  })
  texto: string;
}
