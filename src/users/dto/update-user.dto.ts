import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  name?: string;

  @IsEmail()
  @ApiProperty()
  @IsOptional()
  email?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  age?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  biografia?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  pontos?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  seguidores?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  seguindo?: number;
}