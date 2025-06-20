import sys
import json
import os
import requests
import base64
from typing import Dict, Any, Optional
import argparse
from dotenv import load_dotenv
import time
import re

# Carrega variáveis de ambiente
load_dotenv()
print("ANTHROPIC_API_KEY:", os.getenv("ANTHROPIC_API_KEY"))
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))

class VisionAnalyzer:
    def __init__(self):
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.max_retries = 2
        self.retry_delay = 1

    def _download_and_encode_image(self, image_url: str) -> tuple[str, str]:
        """Baixa imagem e retorna base64 + content-type"""
        try:
            response = requests.get(image_url, timeout=30, stream=True)
            response.raise_for_status()
            
            # Verifica se é realmente uma imagem
            content_type = response.headers.get('content-type', '').lower()
            if not content_type.startswith('image/'):
                raise ValueError(f"URL não contém uma imagem válida. Content-Type: {content_type}")
            
            # Limita o tamanho da imagem (10MB)
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > 10 * 1024 * 1024:
                raise ValueError("Imagem muito grande (>10MB)")
            
            image_data = response.content
            if len(image_data) > 10 * 1024 * 1024:
                raise ValueError("Imagem muito grande (>10MB)")
            
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            return image_base64, content_type
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Erro ao baixar imagem: {str(e)}")

    def _extract_json_from_response(self, text: str) -> Optional[Dict[str, Any]]:
        """Extrai JSON da resposta, mesmo se houver texto extra"""
        try:
            # Primeiro tenta parsear direto
            return json.loads(text.strip())
        except json.JSONDecodeError:
            # Procura por JSON no texto
            json_pattern = r'\{[^{}]*"confidence"[^{}]*"analysis"[^{}]*\}'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue
            
            # Tenta extrair valores manualmente
            confidence_match = re.search(r'"confidence":\s*([0-9]*\.?[0-9]+)', text)
            analysis_match = re.search(r'"analysis":\s*"([^"]*)"', text, re.DOTALL)
            
            if confidence_match and analysis_match:
                return {
                    "confidence": float(confidence_match.group(1)),
                    "analysis": analysis_match.group(1)
                }
            
            return None

    def analyze_with_claude(self, image_url: str, challenge_description: str) -> Dict[str, Any]:
        """Analisa imagem usando Claude com prompt melhorado"""
        for attempt in range(self.max_retries + 1):
            try:
                image_base64, content_type = self._download_and_encode_image(image_url)
                
                prompt = f"""Você é um analista especializado em verificar se imagens correspondem a desafios específicos.

DESAFIO A SER VERIFICADO: "{challenge_description}"

INSTRUÇÕES:
1. Analise cuidadosamente todos os elementos visíveis na imagem
2. Compare objetivamente com o desafio descrito
3. Considere elementos-chave, contexto e detalhes relevantes
4. Seja rigoroso - uma correspondência parcial deve ter confidence baixo

CRITÉRIOS DE AVALIAÇÃO:
- 0.9-1.0: Correspondência perfeita ou quase perfeita
- 0.7-0.8: Boa correspondência com elementos principais presentes
- 0.5-0.6: Correspondência parcial ou ambígua
- 0.3-0.4: Pouca correspondência
- 0.0-0.2: Não corresponde ao desafio

Responda APENAS com JSON válido no formato:
{{"confidence": 0.00, "analysis": "Descrição detalhada do que você vê e como se relaciona com o desafio"}}"""

                headers = {
                    'Content-Type': 'application/json',
                    'x-api-key': self.anthropic_api_key,
                    'anthropic-version': '2023-06-01'
                }

                payload = {
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 1500,
                    "temperature": 0.1,  # Baixa temperatura para mais consistência
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": content_type,
                                        "data": image_base64
                                    }
                                },
                                {
                                    "type": "text",
                                    "text": prompt
                                }
                            ]
                        }
                    ]
                }

                response = requests.post(
                    'https://api.anthropic.com/v1/messages',
                    headers=headers,
                    json=payload,
                    timeout=45
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data.get('content', [{}])[0].get('text', '')
                    
                    # Tenta extrair JSON da resposta
                    result = self._extract_json_from_response(content)
                    
                    if result and 'confidence' in result and 'analysis' in result:
                        # Valida e normaliza confidence
                        confidence = float(result.get('confidence', 0.5))
                        confidence = max(0.0, min(1.0, confidence))  # Garante range 0-1
                        
                        return {
                            'success': True,
                            'confidence': round(confidence, 3),
                            'analysis': result.get('analysis', '').strip(),
                            'provider': 'Claude (Anthropic)',
                            'raw_response': content[:200] + "..." if len(content) > 200 else content
                        }
                    else:
                        return {
                            'success': True,
                            'confidence': 0.5,
                            'analysis': f"Resposta não estruturada: {content[:300]}...",
                            'provider': 'Claude (Anthropic)',
                            'warning': 'Resposta não seguiu formato JSON esperado'
                        }
                
                elif response.status_code == 429:  # Rate limit
                    if attempt < self.max_retries:
                        time.sleep(self.retry_delay * (2 ** attempt))
                        continue
                    else:
                        raise Exception(f"Rate limit excedido após {self.max_retries} tentativas")
                else:
                    raise Exception(f"Erro na API Claude: {response.status_code} - {response.text}")

            except Exception as e:
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay)
                    continue
                else:
                    return {
                        'success': False,
                        'error': str(e),
                        'provider': 'Claude (Anthropic)'
                    }

    def analyze_with_openai(self, image_url: str, challenge_description: str) -> Dict[str, Any]:
        """Analisa imagem usando GPT-4 Vision com prompt melhorado"""
        for attempt in range(self.max_retries + 1):
            try:
                prompt = f"""Você é um especialista em análise de imagens para verificação de desafios.

DESAFIO: "{challenge_description}"

Analise a imagem e determine se ela corresponde ao desafio acima. Seja objetivo e preciso.

ESCALA DE CONFIDENCE:
- 0.9-1.0: Correspondência excelente
- 0.7-0.8: Boa correspondência  
- 0.5-0.6: Correspondência parcial
- 0.3-0.4: Pouca correspondência
- 0.0-0.2: Não corresponde

Responda APENAS com JSON válido:
{{"confidence": 0.00, "analysis": "Sua análise detalhada aqui"}}"""

                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.openai_api_key}'
                }

                payload = {
                    "model": "gpt-4-vision-preview",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": prompt
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": image_url,
                                        "detail": "high"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 1500,
                    "temperature": 0.1
                }

                response = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers=headers,
                    json=payload,
                    timeout=45
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                    
                    result = self._extract_json_from_response(content)
                    
                    if result and 'confidence' in result and 'analysis' in result:
                        confidence = float(result.get('confidence', 0.5))
                        confidence = max(0.0, min(1.0, confidence))
                        
                        return {
                            'success': True,
                            'confidence': round(confidence, 3),
                            'analysis': result.get('analysis', '').strip(),
                            'provider': 'GPT-4 Vision (OpenAI)',
                            'raw_response': content[:200] + "..." if len(content) > 200 else content
                        }
                    else:
                        return {
                            'success': True,
                            'confidence': 0.5,
                            'analysis': f"Resposta não estruturada: {content[:300]}...",
                            'provider': 'GPT-4 Vision (OpenAI)',
                            'warning': 'Resposta não seguiu formato JSON esperado'
                        }
                
                elif response.status_code == 429:
                    if attempt < self.max_retries:
                        time.sleep(self.retry_delay * (2 ** attempt))
                        continue
                    else:
                        raise Exception(f"Rate limit excedido após {self.max_retries} tentativas")
                else:
                    raise Exception(f"Erro na API OpenAI: {response.status_code} - {response.text}")

            except Exception as e:
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay)
                    continue
                else:
                    return {
                        'success': False,
                        'error': str(e),
                        'provider': 'GPT-4 Vision (OpenAI)'
                    }

    def analyze_challenge(self, image_url: str, challenge_description: str, provider: str = "auto") -> Dict[str, Any]:
        """Método principal para análise com seleção de provider"""
        
        # Validações básicas
        if not image_url or not image_url.startswith(('http://', 'https://')):
            return {
                'success': False,
                'error': 'URL da imagem inválida',
                'provider': 'Validation'
            }
        
        if not challenge_description or len(challenge_description.strip()) < 5:
            return {
                'success': False,
                'error': 'Descrição do desafio muito curta ou vazia',
                'provider': 'Validation'
            }
        
        # Escolhe provider baseado na disponibilidade e preferência
        if provider == "claude" or (provider == "auto" and self.anthropic_api_key):
            if self.anthropic_api_key:
                result = self.analyze_with_claude(image_url, challenge_description)
                if result.get('success'):
                    return result
        
        if provider == "openai" or (provider == "auto" and self.openai_api_key):
            if self.openai_api_key:
                result = self.analyze_with_openai(image_url, challenge_description)
                if result.get('success'):
                    return result
        
        return {
            'success': False,
            'error': 'Nenhuma API disponível ou todas falharam',
            'provider': 'None'
        }

def main():
    parser = argparse.ArgumentParser(description='Analisa imagem para verificar correspondência com desafio')
    parser.add_argument('--image-url', required=True, help='URL da imagem')
    parser.add_argument('--challenge', required=True, help='Descrição do desafio')
    parser.add_argument('--provider', choices=['auto', 'claude', 'openai'], default='auto', 
                       help='Provider a usar (padrão: auto)')
    parser.add_argument('--verbose', action='store_true', help='Saída detalhada')
    
    args = parser.parse_args()
    
    analyzer = VisionAnalyzer()
    result = analyzer.analyze_challenge(
        args.image_url, 
        args.challenge,
        args.provider
    )
    
    if args.verbose:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()