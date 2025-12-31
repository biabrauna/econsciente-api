import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateProfilePicDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @ApiPropertyOptional({ description: 'Nome do arquivo (opcional)' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsUrl({}, { message: 'A URL fornecida é inválida' })
  @ApiProperty({ description: 'URL da foto de perfil no Cloudinary' })
  @IsNotEmpty({ message: 'A URL é obrigatória' })
  url: string;
}

export class CreateProfilePicWithUserDto extends CreateProfilePicDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
