import { ApiProperty } from '@nestjs/swagger';

export class FollowDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID do relacionamento' })
  id: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID do seguidor' })
  followerId: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID do usuário sendo seguido' })
  followingId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data que começou a seguir' })
  createdAt: string;
}

export class FollowerDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID do usuário' })
  id: number;

  @ApiProperty({ example: 'João Silva', description: 'Nome do usuário' })
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'Email do usuário' })
  email: string;

  @ApiProperty({ example: 150, description: 'Pontos do usuário' })
  pontos: number;

  @ApiProperty({ example: 'Amante da natureza', description: 'Biografia do usuário', required: false })
  biografia?: string;
}
