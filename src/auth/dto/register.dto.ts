import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: '19', type: String })
  @IsNotEmpty({ message: 'A idade é obrigatória' })
  age: string;

  @ApiProperty({ example: 'Eu sou jogadora de basquete', type: String })
  @IsOptional()
  biografia?: string;
}