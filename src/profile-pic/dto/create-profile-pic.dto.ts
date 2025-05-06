import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProfilePicDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'A URL é obrigatória' })
  url: string;
}
