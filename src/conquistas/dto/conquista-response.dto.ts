import { ApiProperty } from '@nestjs/swagger';

export class ConquistaDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID da conquista' })
  id: number;

  @ApiProperty({ example: 'Primeira Foto', description: 'Nome da conquista' })
  nome: string;

  @ApiProperty({ example: 'Adicione sua primeira foto de perfil', description: 'Descrição da conquista' })
  descricao: string;

  @ApiProperty({ example: '📷', description: 'Ícone/emoji da conquista' })
  icone: string;

  @ApiProperty({ example: 'perfil', description: 'Tipo da conquista' })
  tipo: string;

  @ApiProperty({ example: 10, description: 'Pontos de recompensa' })
  pontosRecompensa: number;

  @ApiProperty({ example: false, description: 'Se o usuário desbloqueou esta conquista', required: false })
  desbloqueada?: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data de desbloqueio', required: false })
  desbloqueadaEm?: string;
}

export class ConquistaUsuarioDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID da relação' })
  id: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID do usuário' })
  userId: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID da conquista' })
  conquistaId: number;

  @ApiProperty({ type: ConquistaDto, description: 'Dados da conquista' })
  conquista: ConquistaDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Data de desbloqueio' })
  desbloqueadaEm: string;
}
