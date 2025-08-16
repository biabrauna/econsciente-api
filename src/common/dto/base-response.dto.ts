import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({ example: true, description: 'Indica se a operação foi bem-sucedida' })
  success: boolean;

  @ApiProperty({ example: 'Operação realizada com sucesso', description: 'Mensagem da resposta' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Timestamp da resposta' })
  timestamp: string;
}

export class PaginationQueryDto {
  @ApiProperty({ 
    required: false, 
    default: 1, 
    minimum: 1,
    description: 'Número da página' 
  })
  page?: number = 1;

  @ApiProperty({ 
    required: false, 
    default: 10, 
    minimum: 1, 
    maximum: 100,
    description: 'Quantidade de itens por página' 
  })
  limit?: number = 10;
}

export class PaginatedResponseDto<T> extends BaseResponseDto {
  @ApiProperty({ description: 'Dados paginados' })
  data: T[];

  @ApiProperty({ 
    example: { page: 1, limit: 10, total: 100, totalPages: 10 },
    description: 'Informações de paginação' 
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}