import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'test1@example.com', type: String })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'secret', type: String })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'secret', type: String })
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  confirmPassword: string;

  @ApiProperty({ example: 19, type: Number })
  @IsNotEmpty({ message: 'A idade é obrigatória' })
  @Type(() => Number)
  @IsInt({ message: 'A idade deve ser um número inteiro' })
  @Min(13, { message: 'Idade mínima é 13 anos' })
  @Max(120, { message: 'Idade máxima é 120 anos' })
  age: number;

  @ApiProperty({
    example: 'Eu sou jogadora de basquete',
    type: String,
    required: false,
  })
  @IsOptional()
  biografia?: string;
}
