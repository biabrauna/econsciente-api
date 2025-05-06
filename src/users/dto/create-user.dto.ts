import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  confirmPassword: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'A idade é obrigatória' })
  age: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  biografia?: string;
}