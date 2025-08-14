import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
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
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('user')
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
        name: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: { session?: { userId?: string; sessionHash?: string } },
  ) {
    return this.authService.login(loginDto, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(
    @Req()
    req: {
      session?: { destroy?: (callback: (err: Error | null) => void) => void };
    },
  ) {
    return new Promise((resolve, reject) => {
      if (req.session && req.session.destroy) {
        req.session.destroy((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve({ message: 'Logout realizado com sucesso' });
          }
        });
      } else {
        resolve({ message: 'Logout realizado com sucesso' });
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  me(@Request() req: { user?: object }) {
    return req.user;
  }
}
