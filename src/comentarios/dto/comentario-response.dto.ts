import { ApiProperty } from '@nestjs/swagger';

export class ComentarioResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  postId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  userId: string;

  @ApiProperty({ example: 'João Silva' })
  userName: string;

  @ApiProperty({ example: 'Parabéns pela iniciativa!' })
  texto: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
