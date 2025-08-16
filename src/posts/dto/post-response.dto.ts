import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID único do post' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID do usuário que criou o post' })
  userId: string;

  @ApiProperty({ 
    example: 'https://example.com/image.jpg', 
    description: 'URL da imagem do post' 
  })
  url: string;

  @ApiProperty({ example: 42, description: 'Número de likes no post' })
  likes: number;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}