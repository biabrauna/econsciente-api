import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum SubmissaoStatusDto {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export class UpdateSubmissaoStatusDto {
  @IsEnum(SubmissaoStatusDto, { message: 'Status deve ser SUCCESS ou ERROR' })
  @IsNotEmpty()
  @ApiProperty({ enum: SubmissaoStatusDto, example: 'SUCCESS' })
  status: SubmissaoStatusDto;
}
