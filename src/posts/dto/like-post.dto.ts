import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LikePostDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID do usuário que está curtindo o post'
  })
  userId: string;
}
