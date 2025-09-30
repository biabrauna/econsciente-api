import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Cria uma nova conta de usuário no sistema. Requer confirmação de senha e email único.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Dados necessários para criar uma nova conta',
    examples: {
      example1: {
        summary: 'Exemplo de registro',
        value: {
          name: 'João Silva',
          email: 'joao@email.com',
          password: 'minhasenha123',
          confirmPassword: 'minhasenha123',
          age: '25',
          biografia: 'Desenvolvedor apaixonado por sustentabilidade',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@email.com' },
        age: { type: 'string', example: '25' },
        biografia: {
          type: 'string',
          example: 'Desenvolvedor apaixonado por sustentabilidade',
        },
        pontos: { type: 'number', example: 0 },
        seguidores: { type: 'number', example: 0 },
        seguindo: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'As senhas devem ser iguais' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/register' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      properties: {
        access_token: { type: 'string' },
        userId: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // DEPRECATED: Alias for backward compatibility - use /auth/login instead
  @Post('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login do usuário (DEPRECATED)',
    description: 'Esta rota está deprecated. Use POST /auth/login',
    deprecated: true
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async loginDeprecated(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@email.com' },
        age: { type: 'number', example: 25 },
        biografia: { type: 'string', example: 'Desenvolvedor' },
        pontos: { type: 'number', example: 150 },
        seguidores: { type: 'number', example: 42 },
        seguindo: { type: 'number', example: 38 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  me(@Request() req: { user?: any }) {
    return req.user;
  }
}
