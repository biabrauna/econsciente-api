import { IsString, IsUrl, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChallengeVerificationDto {
  @ApiProperty({
    description: 'URL da imagem a ser analisada',
    example: 'https://res.cloudinary.com/exemplo/image/upload/v123456/desafio.jpg'
  })
  @IsUrl({}, { message: 'URL da imagem deve ser válida' })
  @IsNotEmpty({ message: 'URL da imagem é obrigatória' })
  imageUrl: string;

  @ApiProperty({
    description: 'Descrição do desafio a ser verificado',
    example: 'coletar 10 tampinhas de garrafa PET'
  })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição do desafio é obrigatória' })
  challengeDescription: string;

  @ApiProperty({
    description: 'ID do desafio a ser concluído',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString({ message: 'ID do desafio deve ser uma string' })
  @IsNotEmpty({ message: 'ID do desafio é obrigatório' })
  challengeId: string;

  @ApiProperty({
    description: 'ID do usuário que está completando o desafio',
    example: '507f1f77bcf86cd799439012'
  })
  @IsString({ message: 'ID do usuário deve ser uma string' })
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Se true, usa simulação ao invés das APIs reais',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  useSimulation?: boolean = false;
}

export class ChallengeVerificationResponse {
  @ApiProperty({ description: 'Se a análise foi bem-sucedida' })
  success: boolean;

  @ApiProperty({
    description: 'Nível de confiança da análise (0.0 a 1.0)',
    minimum: 0,
    maximum: 1,
    example: 0.87
  })
  confidence: number;

  @ApiProperty({
    description: 'Análise detalhada da imagem',
    example: 'A imagem mostra 12 tampinhas de garrafas PET coletadas...'
  })
  analysis: string;

  @ApiProperty({
    description: 'Provedor de IA utilizado',
    example: 'Claude (Anthropic)'
  })
  provider: string;

  @ApiProperty({ description: 'Timestamp da análise' })
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Mensagem de erro, se houver' })
  error?: string;

  @ApiPropertyOptional({ description: 'ID do desafio concluído, se aplicável' })
  challengeCompletedId?: string;

  @ApiPropertyOptional({ description: 'Pontos adicionados ao usuário' })
  pointsAwarded?: number;
}