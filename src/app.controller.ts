import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CombinedAuthGuard } from './auth/combined-auth.guard';

@ApiTags('app')
@ApiBearerAuth('JWT-auth')
@UseGuards(CombinedAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Hello World' })
  @ApiResponse({ status: 200, description: 'Mensagem de boas-vindas' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  getRoot(): string {
    return this.appService.getHello();
  }
}
