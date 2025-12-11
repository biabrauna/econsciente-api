import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('sessions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Listar sessões ativas do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de sessões ativas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionToken: { type: 'string' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          lastActivity: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async getActiveSessions(@Request() req: any) {
    return this.sessionsService.getUserActiveSessions(req.user.id);
  }

  @Delete(':sessionId')
  @ApiOperation({ summary: 'Invalidar uma sessão específica' })
  @ApiParam({ name: 'sessionId', description: 'Token da sessão' })
  @ApiResponse({ status: 200, description: 'Sessão invalidada com sucesso' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async invalidateSession(@Param('sessionId') sessionToken: string) {
    await this.sessionsService.invalidateSession(sessionToken);
    return { message: 'Sessão invalidada com sucesso' };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Invalidar todas as sessões do usuário (logout de todos os dispositivos)' })
  @ApiResponse({ status: 200, description: 'Todas as sessões invalidadas' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async invalidateAllSessions(@Request() req: any) {
    await this.sessionsService.invalidateAllUserSessions(req.user.id);
    return { message: 'Todas as sessões foram invalidadas' };
  }
}
