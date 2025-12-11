import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateNotificacaoDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID do usuário' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'conquista',
    description: 'Tipo da notificação',
    enum: ['conquista', 'seguidor', 'like', 'comentario']
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['conquista', 'seguidor', 'like', 'comentario'])
  tipo: string;

  @ApiProperty({ example: 'Nova conquista desbloqueada!', description: 'Título da notificação' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Você desbloqueou a conquista "Primeira Foto"', description: 'Mensagem da notificação' })
  @IsString()
  @IsNotEmpty()
  mensagem: string;

  @ApiProperty({
    example: '{"conquistaId": "507f1f77bcf86cd799439013"}',
    description: 'Metadados adicionais em JSON',
    required: false
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}
