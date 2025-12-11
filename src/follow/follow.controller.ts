import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowDto, FollowerDto } from './dto/follow-response.dto';

@ApiTags('follow')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('follow')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Seguir um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário a seguir' })
  @ApiResponse({ status: 201, description: 'Seguindo o usuário', type: FollowDto })
  @ApiResponse({ status: 400, description: 'Já segue este usuário ou tentativa de seguir a si mesmo' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  follow(@Param('userId') userId: string, @Request() req: any) {
    return this.followService.follow(req.user.id, userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Deixar de seguir um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário para deixar de seguir' })
  @ApiResponse({ status: 200, description: 'Deixou de seguir com sucesso' })
  @ApiResponse({ status: 400, description: 'Não segue este usuário' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  unfollow(@Param('userId') userId: string, @Request() req: any) {
    return this.followService.unfollow(req.user.id, userId);
  }

  @Get('check/:userId')
  @ApiOperation({ summary: 'Verificar se segue um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário para verificar' })
  @ApiResponse({
    status: 200,
    description: 'Status de seguimento',
    schema: {
      type: 'object',
      properties: {
        isFollowing: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async isFollowing(@Param('userId') userId: string, @Request() req: any) {
    const isFollowing = await this.followService.isFollowing(req.user.id, userId);
    return { isFollowing };
  }

  @Get('followers/:userId')
  @ApiOperation({ summary: 'Listar seguidores de um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de seguidores', type: [FollowerDto] })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }

  @Get('following/:userId')
  @ApiOperation({ summary: 'Listar usuários que um usuário está seguindo' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de usuários seguidos', type: [FollowerDto] })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId);
  }

  @Get('my-followers')
  @ApiOperation({ summary: 'Listar meus seguidores' })
  @ApiResponse({ status: 200, description: 'Lista de meus seguidores', type: [FollowerDto] })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  getMyFollowers(@Request() req: any) {
    return this.followService.getFollowers(req.user.id);
  }

  @Get('my-following')
  @ApiOperation({ summary: 'Listar usuários que estou seguindo' })
  @ApiResponse({ status: 200, description: 'Lista de usuários que sigo', type: [FollowerDto] })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  getMyFollowing(@Request() req: any) {
    return this.followService.getFollowing(req.user.id);
  }
}
