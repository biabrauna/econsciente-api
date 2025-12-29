import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from './validators/match.validator';
import { IsStrongPassword } from './validators/password-strength.validator';

export class RegisterDto {
  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'test1@example.com', type: String })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'senha123', type: String })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'senha123', type: String })
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @Match('password', { message: 'As senhas devem ser iguais' })
  confirmPassword: string;

  @ApiProperty({ example: '2000-01-15', type: String })
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida no formato YYYY-MM-DD' })
  dataNascimento: string;

  @ApiProperty({
    example: 'Eu sou jogadora de basquete',
    type: String,
    required: false,
  })
  @IsOptional()
  biografia?: string;
}
