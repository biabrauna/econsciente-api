import { 
    Controller, 
    Post, 
    Body, 
    HttpException, 
    HttpStatus,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
  import { PythonVisionService } from './python-vision.service';
  import { 
    ChallengeVerificationDto, 
    ChallengeVerificationResponse 
  } from './dto/challenge-verification.dto';
  
  @ApiTags('vision')
  @Controller('vision')
  export class VisionController {
    constructor(private readonly pythonVisionService: PythonVisionService) {}
  
    @Post('verify-challenge')
    @ApiOperation({ 
      summary: 'Verifica se uma imagem corresponde a um desafio',
      description: 'Usa IA para analisar uma imagem e verificar se ela atende aos critérios de um desafio ambiental'
    })
    @ApiBody({ type: ChallengeVerificationDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Análise realizada com sucesso',
      type: ChallengeVerificationResponse
    })
    @ApiResponse({ 
      status: 400, 
      description: 'Dados de entrada inválidos' 
    })
    @ApiResponse({ 
      status: 500, 
      description: 'Erro interno do servidor' 
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async verifyChallengeCompletion(
      @Body() challengeData: ChallengeVerificationDto,
    ): Promise<ChallengeVerificationResponse> {
      try {
        const result = await this.pythonVisionService.analyzeChallengeImage(
          challengeData.imageUrl,
          challengeData.challengeDescription,
          challengeData.useSimulation
        );
  
        return {
          ...result,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: 'Erro ao analisar imagem do desafio',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  