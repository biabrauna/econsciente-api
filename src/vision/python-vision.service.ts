import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

interface PythonAnalysisResult {
  success: boolean;
  confidence: number;
  analysis: string;
  provider: string;
  error?: string;
}

@Injectable()
export class PythonVisionService {
  private readonly logger = new Logger(PythonVisionService.name);
  private readonly pythonScriptPath: string;
  private readonly pythonExecutable: string;
  private readonly hasAnthropicKey: boolean;
  private readonly hasOpenAiKey: boolean;

  constructor() {
    // Caminho para o script Python (pode ser configurado via env)
    this.pythonScriptPath =
      process.env.PYTHON_SCRIPT_PATH ||
      path.join(process.cwd(), 'scripts', 'vision_analyzer.py');

    // Python executable configurável por ambiente (python3 no Linux/Mac, python no Windows)
    this.pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python3';

    // Verifica disponibilidade de API keys no startup
    this.hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    this.hasOpenAiKey = !!process.env.OPENAI_API_KEY;

    if (!this.hasAnthropicKey && !this.hasOpenAiKey) {
      this.logger.warn(
        '⚠️ Nenhuma API key configurada (ANTHROPIC_API_KEY ou OPENAI_API_KEY). Sistema funcionará em modo fallback.',
      );
    }
  }

  /**
   * Retorna resultado de fallback confiável quando APIs não disponíveis
   */
  private getFallbackResult(
    challengeDescription: string,
  ): PythonAnalysisResult {
    return {
      success: true,
      confidence: 0.75,
      analysis: `[MODO DESENVOLVIMENTO] Análise simulada do desafio: "${challengeDescription}". As APIs de visão computacional (Claude/OpenAI) não estão configuradas. Em produção, configure ANTHROPIC_API_KEY ou OPENAI_API_KEY para análise real com IA.`,
      provider: 'Fallback Simulado',
    };
  }

  async analyzeChallengeImage(
    imageUrl: string,
    challengeDescription: string,
    useSimulation: boolean = false,
  ): Promise<PythonAnalysisResult> {
    // Se forçar simulação ou não tem nenhuma API key, usa fallback diretamente
    if (useSimulation || (!this.hasAnthropicKey && !this.hasOpenAiKey)) {
      this.logger.log(
        `🔄 Usando modo fallback simulado (APIs não disponíveis ou simulação forçada)`,
      );
      return this.getFallbackResult(challengeDescription);
    }

    return new Promise((resolve, reject) => {
      const args = [
        this.pythonScriptPath,
        '--image-url',
        imageUrl,
        '--challenge',
        challengeDescription,
      ];

      // Força simulação se não há API keys (camada extra de segurança)
      if (!this.hasAnthropicKey && !this.hasOpenAiKey) {
        args.push('--simulate');
      }

      this.logger.log(
        `🐍 Executando análise de visão: ${challengeDescription.substring(0, 50)}...`,
      );

      const pythonProcess = spawn(this.pythonExecutable, args);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout.trim());
            this.logger.log(
              `✅ Análise concluída: confidence=${result.confidence}, provider=${result.provider}`,
            );
            resolve(result);
          } catch (error) {
            this.logger.error('❌ Erro ao parsear resposta do Python:', error);
            // Fallback em caso de erro de parsing
            resolve(this.getFallbackResult(challengeDescription));
          }
        } else {
          this.logger.error(
            `❌ Script Python falhou com código ${code}: ${stderr}`,
          );
          // Fallback em caso de falha do script
          resolve(this.getFallbackResult(challengeDescription));
        }
      });

      pythonProcess.on('error', (error) => {
        this.logger.error('❌ Erro ao executar script Python:', error);
        // Fallback em caso de erro de execução
        resolve(this.getFallbackResult(challengeDescription));
      });

      // Timeout de 60 segundos
      setTimeout(() => {
        pythonProcess.kill();
        this.logger.warn('⏰ Timeout ao executar Python, usando fallback');
        resolve(this.getFallbackResult(challengeDescription));
      }, 60000);
    });
  }
}
