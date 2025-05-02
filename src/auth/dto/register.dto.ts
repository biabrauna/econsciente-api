import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'A idade é obrigatória' })
  age: string;

  @IsString()
  @IsOptional()
  biografia?: string;
}