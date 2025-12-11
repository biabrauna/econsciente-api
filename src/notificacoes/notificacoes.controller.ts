import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service';
import { NotificacaoDto } from './dto/notificacao-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notificacoes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private notificacoesService: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário logado' })
  @ApiQuery({
    name: 'onlyUnread',
    required: false,
    type: Boolean,
    description: 'Filtrar apenas não lidas'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações',
    type: [NotificacaoDto]
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findMyNotifications(@Request() req: any, @Query('onlyUnread') onlyUnread?: string) {
    const onlyUnreadBool = onlyUnread === 'true';
    return this.notificacoesService.findByUser(req.user.id, onlyUnreadBool);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Quantidade de notificações não lidas',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async countUnread(@Request() req: any) {
    const count = await this.notificacoesService.countUnread(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificacoesService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Todas notificações marcadas como lidas' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  markAllAsRead(@Request() req: any) {
    return this.notificacoesService.markAllAsRead(req.user.id);
  }
}
