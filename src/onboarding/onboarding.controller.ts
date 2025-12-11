import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OnboardingStatusDto, CompleteStepDto } from './dto/onboarding-status.dto';

@ApiTags('onboarding')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obter status do onboarding do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Status do onboarding',
    type: OnboardingStatusDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  getStatus(@Request() req: any) {
    return this.onboardingService.getStatus(req.user.id);
  }

  @Post('complete-step')
  @ApiOperation({ summary: 'Marcar etapa do onboarding como concluída' })
  @ApiBody({ type: CompleteStepDto })
  @ApiResponse({
    status: 200,
    description: 'Etapa marcada como concluída',
    type: OnboardingStatusDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  completeStep(@Request() req: any, @Body() dto: CompleteStepDto) {
    return this.onboardingService.completeStep(req.user.id, dto.step);
  }
}
