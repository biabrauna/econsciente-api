import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateConquistaDto {
  @ApiProperty({ example: 'Primeira Foto', description: 'Nome da conquista' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Adicione sua primeira foto de perfil', description: 'Descrição da conquista' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ example: '📷', description: 'Ícone/emoji da conquista' })
  @IsString()
  @IsNotEmpty()
  icone: string;

  @ApiProperty({
    example: 'perfil',
    description: 'Tipo da conquista',
    enum: ['desafios', 'pontos', 'social', 'perfil']
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    example: '{"action": "upload_profile_pic"}',
    description: 'Critério em formato JSON string'
  })
  @IsString()
  @IsNotEmpty()
  criterio: string;

  @ApiProperty({ example: 10, description: 'Pontos de recompensa' })
  @IsInt()
  @Min(0)
  pontosRecompensa: number;
}
