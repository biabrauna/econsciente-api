import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  @ApiProperty({ example: 'joao@example.com' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'senha123' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsString()
  @ApiProperty({ example: 'senha123' })
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  confirmPassword: string;

  @IsDateString({}, { message: 'Data de nascimento inválida' })
  @ApiProperty({ example: '1990-01-15' })
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
  dataNascimento: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  biografia?: string;
}