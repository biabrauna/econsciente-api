import { Injectable } from '@nestjs/common';
import { PythonVisionService } from './python-vision.service';

/**
 * VisionService - Alias/Wrapper para PythonVisionService
 *
 * Este serviço fornece uma interface compatível para análise de visão computacional
 * delegando as chamadas para o PythonVisionService que executa scripts Python
 * com integração de APIs de IA (Claude/OpenAI).
 */
@Injectable()
export class VisionService extends PythonVisionService {
  // Herda todos os métodos de PythonVisionService
  // Pode adicionar métodos adicionais se necessário no futuro
}
