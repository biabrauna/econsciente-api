import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, MaxLength, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
    minLength: 2,
    maxLength: 100,
    required: false
  })
  name?: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsOptional()
  @ApiProperty({
    example: 'joao@email.com',
    description: 'Email do usuário',
    required: false
  })
  email?: string;

  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida' })
  @IsOptional()
  @ApiProperty({
    example: '1990-01-15',
    description: 'Data de nascimento do usuário',
    required: false
  })
  dataNascimento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Biografia deve ter no máximo 500 caracteres' })
  @ApiProperty({ 
    example: 'Desenvolvedor apaixonado por sustentabilidade', 
    description: 'Biografia do usuário',
    maxLength: 500,
    required: false
  })
  biografia?: string;

  @IsNumber({}, { message: 'Pontos deve ser um número válido' })
  @IsOptional()
  @ApiProperty({ 
    example: 150, 
    description: 'Pontos acumulados pelo usuário',
    required: false
  })
  pontos?: number;

  @IsNumber({}, { message: 'Seguidores deve ser um número válido' })
  @IsOptional()
  @ApiProperty({ 
    example: 42, 
    description: 'Número de seguidores',
    required: false
  })
  seguidores?: number;

  @IsNumber({}, { message: 'Seguindo deve ser um número válido' })
  @IsOptional()
  @ApiProperty({ 
    example: 38, 
    description: 'Número de pessoas que o usuário segue',
    required: false
  })
  seguindo?: number;
}