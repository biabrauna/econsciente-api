import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', description: 'Status da aplicação' })
  status: string;

  @ApiProperty({ example: '1.0.0', description: 'Versão da aplicação' })
  version: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Timestamp da verificação' })
  timestamp: string;

  @ApiProperty({ 
    example: { uptime: '1d 2h 30m', memory: { used: '125MB', total: '512MB' } },
    description: 'Informações do sistema'
  })
  info: {
    uptime: string;
    memory: {
      used: string;
      total: string;
    };
  };
}