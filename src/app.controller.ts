import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthCheckResponseDto } from './common/dto/health-check.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health Check',
    description: 'Endpoint para verificar se a API está funcionando corretamente e obter informações do sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API está funcionando corretamente',
    type: HealthCheckResponseDto
  })
  getHealthCheck(): HealthCheckResponseDto {
    return this.appService.getHealthCheck();
  }

  @Get('hello')
  @ApiOperation({ 
    summary: 'Hello World',
    description: 'Endpoint simples que retorna uma mensagem de boas-vindas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensagem de boas-vindas',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
