# Vision Module

Módulo de análise de imagens com IA para verificação de desafios ambientais.

## Arquivos

- **vision.service.ts** - Serviço principal (wrapper para PythonVisionService)
- **python-vision.service.ts** - Integração com script Python de análise de visão
- **image-validator.service.ts** - Validação de URLs e integridade de imagens
- **vision.controller.ts** - Controller REST para endpoint `/vision/verify-challenge`
- **vision.module.ts** - Módulo NestJS

## Funcionalidade

O módulo permite verificar se uma imagem corresponde a um desafio específico usando:

1. **Claude (Anthropic)** - Modelo de visão preferencial
2. **GPT-4 Vision (OpenAI)** - Fallback secundário
3. **Modo Simulação** - Fallback final quando APIs não disponíveis

## Uso

### API Endpoint

```
POST /vision/verify-challenge
```

**Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "challengeDescription": "Coletar 10 tampinhas de garrafa PET",
  "challengeId": 1,
  "userId": 1,
  "useSimulation": false
}
```

**Response:**
```json
{
  "success": true,
  "confidence": 0.87,
  "analysis": "A imagem mostra 12 tampinhas de garrafas PET...",
  "provider": "Claude (Anthropic)",
  "timestamp": "2024-01-07T00:00:00.000Z",
  "challengeCompletedId": 42,
  "pointsAwarded": 50
}
```

## Configuração

Variáveis de ambiente necessárias (`.env`):

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PYTHON_EXECUTABLE=python3
PYTHON_SCRIPT_PATH=./scripts/vision_analyzer.py
```

## Script Python

O módulo depende do script Python `scripts/vision_analyzer.py` que:

- Aceita URL da imagem e descrição do desafio
- Integra com APIs Claude/OpenAI
- Retorna JSON com análise e nível de confiança
- Suporta modo `--simulate` para testes sem API

## Modos de Operação

1. **Produção**: Usa APIs reais (Claude/OpenAI)
2. **Simulação**: Retorna resultado mock (útil para desenvolvimento)
3. **Fallback**: Se APIs falharem, usa simulação automaticamente
