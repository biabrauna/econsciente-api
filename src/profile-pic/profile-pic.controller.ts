import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProfilePicService } from './profile-pic.service';
import { CreateProfilePicDto } from './dto/create-profile-pic.dto';
import { CombinedAuthGuard } from '../auth/combined-auth.guard';

@ApiTags('profile-pic')
@ApiBearerAuth('JWT-auth')
@UseGuards(CombinedAuthGuard)
@Controller('profile-pic')
export class ProfilePicController {
  constructor(private profilePicService: ProfilePicService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova foto de perfil' })
  @ApiBody({ type: CreateProfilePicDto })
  @ApiResponse({ status: 201, description: 'Foto de perfil criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  create(@Body() createProfilePicDto: CreateProfilePicDto) {
    return this.profilePicService.create(createProfilePicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as fotos de perfil' })
  @ApiResponse({ status: 200, description: 'Lista de fotos de perfil' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findAll() {
    return this.profilePicService.findAll();
  }
}
