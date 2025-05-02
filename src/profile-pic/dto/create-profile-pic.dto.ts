import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProfilePicDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'A URL é obrigatória' })
  url: string;
}
