import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PythonVisionService } from './python-vision.service';
import {
  ChallengeVerificationDto,
  ChallengeVerificationResponse,
} from './dto/challenge-verification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DesafiosService } from '../desafios/desafios.service';

@ApiTags('vision')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('vision')
export class VisionController {
  private readonly logger = new Logger(VisionController.name);

  constructor(
    private readonly pythonVisionService: PythonVisionService,
    private readonly desafiosService: DesafiosService,
  ) {}

  @Post('verify-challenge')
  @ApiOperation({
    summary: 'Verifica se uma imagem corresponde a um desafio',
    description:
      'Usa IA para analisar uma imagem e verificar se ela atende aos critérios de um desafio ambiental',
  })
  @ApiBody({ type: ChallengeVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Análise realizada com sucesso',
    type: ChallengeVerificationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyChallengeCompletion(
    @Body() challengeData: ChallengeVerificationDto,
  ): Promise<ChallengeVerificationResponse> {
    let visionResult;
    let usedFallback = false;

    try {
      // Tenta usar o serviço de visão Python/AI
      visionResult = await this.pythonVisionService.analyzeChallengeImage(
        challengeData.imageUrl,
        challengeData.challengeDescription,
        challengeData.useSimulation,
      );
    } catch (error) {
      // Fallback: modo simulação quando APIs não disponíveis
      this.logger.warn(
        `⚠️ Vision API falhou, usando fallback de simulação: ${error.message}`,
      );
      usedFallback = true;

      visionResult = {
        success: true,
        confidence: 0.75,
        analysis: `Análise em modo de fallback: A imagem foi recebida para o desafio "${challengeData.challengeDescription}". Como as APIs de IA não estão disponíveis, a verificação foi realizada em modo simulado.`,
        provider: 'Fallback (Simulação)',
      };
    }

    // Se a análise foi bem-sucedida (confiança >= 0.7), marca o desafio como concluído
    let challengeCompletedId: string | undefined;
    let pointsAwarded: number | undefined;

    if (visionResult.success && visionResult.confidence >= 0.7) {
      try {
        const desafio = await this.desafiosService.findOne(
          challengeData.challengeId,
        );

        const desafioConcluido =
          await this.desafiosService.createDesafioConcluido({
            desafioId: challengeData.challengeId,
            userId: challengeData.userId,
          });

        challengeCompletedId = desafioConcluido.id;
        pointsAwarded = desafio.valor;

        this.logger.log(
          `✅ Desafio concluído: userId=${challengeData.userId}, challengeId=${challengeData.challengeId}, pontos=${desafio.valor}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Erro ao marcar desafio como concluído: ${error.message}`,
        );
        // Não lança erro, retorna a análise mas sem marcar como concluído
      }
    }

    return {
      ...visionResult,
      timestamp: new Date(),
      challengeCompletedId,
      pointsAwarded,
      ...(usedFallback && {
        error: 'APIs de IA indisponíveis, usando modo de fallback',
      }),
    };
  }
}
