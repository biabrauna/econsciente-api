import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  age?: string;

  @IsString()
  @IsOptional()
  biografia?: string;

  @IsNumber()
  @IsOptional()
  pontos?: number;

  @IsNumber()
  @IsOptional()
  seguidores?: number;

  @IsNumber()
  @IsOptional()
  seguindo?: number;
}