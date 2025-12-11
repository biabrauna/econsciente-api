import { ApiProperty } from '@nestjs/swagger';

export class NotificacaoDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID da notificação' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID do usuário' })
  userId: string;

  @ApiProperty({
    example: 'conquista',
    description: 'Tipo da notificação',
    enum: ['conquista', 'seguidor', 'like', 'comentario']
  })
  tipo: string;

  @ApiProperty({ example: 'Nova conquista desbloqueada!', description: 'Título da notificação' })
  titulo: string;

  @ApiProperty({ example: 'Você desbloqueou a conquista "Primeira Foto"', description: 'Mensagem da notificação' })
  mensagem: string;

  @ApiProperty({ example: false, description: 'Se a notificação foi lida' })
  lida: boolean;

  @ApiProperty({
    example: '{"conquistaId": "507f1f77bcf86cd799439013"}',
    description: 'Metadados adicionais em JSON',
    required: false
  })
  metadata?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data de criação' })
  createdAt: string;
}
