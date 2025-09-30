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

  constructor() {
    // Caminho para o script Python (pode ser configurado via env)
    this.pythonScriptPath =
      process.env.PYTHON_SCRIPT_PATH ||
      path.join(process.cwd(), 'scripts', 'vision_analyzer.py');

    // Python executable configurável por ambiente (python3 no Linux/Mac, python no Windows)
    this.pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python3';
  }

  async analyzeChallengeImage(
    imageUrl: string,
    challengeDescription: string,
    useSimulation: boolean = false,
  ): Promise<PythonAnalysisResult> {
    return new Promise((resolve, reject) => {
      const args = [
        this.pythonScriptPath,
        '--image-url',
        imageUrl,
        '--challenge',
        challengeDescription,
      ];

      if (useSimulation) {
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
            reject(new Error(`Erro ao parsear resposta: ${error.message}`));
          }
        } else {
          this.logger.error(
            `❌ Script Python falhou com código ${code}: ${stderr}`,
          );
          reject(new Error(`Script Python falhou: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        this.logger.error('❌ Erro ao executar script Python:', error);
        reject(new Error(`Erro ao executar Python: ${error.message}`));
      });

      // Timeout de 60 segundos
      setTimeout(() => {
        pythonProcess.kill();
        reject(
          new Error('⏰ Timeout: Script Python demorou mais que 60 segundos'),
        );
      }, 60000);
    });
  }
}
