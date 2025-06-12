import sys
import json
import os
import requests
import base64
from typing import Dict, Any
import argparse
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

class VisionAnalyzer:
    def __init__(self):
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')

    def analyze_with_claude(self, image_url: str, challenge_description: str) -> Dict[str, Any]:
        """Analisa imagem usando Claude"""
        try:
            # Baixa a imagem e converte para base64
            image_response = requests.get(image_url)
            image_base64 = base64.b64encode(image_response.content).decode('utf-8')
            
            # Determina o tipo MIME da imagem
            content_type = image_response.headers.get('content-type', 'image/jpeg')
            
            prompt = f"""
            Analise esta imagem e determine se ela corresponde ao seguinte desafio:
            "{challenge_description}"

            Por favor:
            1. Descreva o que você vê na imagem
            2. Compare com o desafio solicitado
            3. Forneça uma pontuação de 0.0 a 1.0 indicando a probabilidade de correspondência
            4. Justifique sua avaliação

            Responda APENAS no formato JSON:
            {{
                "confidence": 0.85,
                "analysis": "Sua análise detalhada aqui"
            }}
            """

            headers = {
                'Content-Type': 'application/json',
                'x-api-key': self.anthropic_api_key,
                'anthropic-version': '2023-06-01'
            }

            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1000,
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
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                content = data.get('content', [{}])[0].get('text', '')
                
                try:
                    # Tenta parsear a resposta JSON
                    result = json.loads(content)
                    return {
                        'success': True,
                        'confidence': result.get('confidence', 0.5),
                        'analysis': result.get('analysis', content),
                        'provider': 'Claude (Anthropic)'
                    }
                except json.JSONDecodeError:
                    return {
                        'success': True,
                        'confidence': 0.5,
                        'analysis': content,
                        'provider': 'Claude (Anthropic)'
                    }
            else:
                raise Exception(f"Erro na API Claude: {response.status_code} - {response.text}")

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'provider': 'Claude (Anthropic)'
            }

    def analyze_with_openai(self, image_url: str, challenge_description: str) -> Dict[str, Any]:
        """Analisa imagem usando GPT-4 Vision"""
        try:
            prompt = f"""
            Analise esta imagem e determine se ela corresponde ao seguinte desafio:
            "{challenge_description}"

            Responda APENAS no formato JSON:
            {{
                "confidence": 0.85,
                "analysis": "Sua análise detalhada aqui"
            }}
            """

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
                                    "url": image_url
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 1000
            }

            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                
                try:
                    result = json.loads(content)
                    return {
                        'success': True,
                        'confidence': result.get('confidence', 0.5),
                        'analysis': result.get('analysis', content),
                        'provider': 'GPT-4 Vision (OpenAI)'
                    }
                except json.JSONDecodeError:
                    return {
                        'success': True,
                        'confidence': 0.5,
                        'analysis': content,
                        'provider': 'GPT-4 Vision (OpenAI)'
                    }
            else:
                raise Exception(f"Erro na API OpenAI: {response.status_code} - {response.text}")

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'provider': 'GPT-4 Vision (OpenAI)'
            }

    def simulate_analysis(self, image_url: str, challenge_description: str) -> Dict[str, Any]:
        """Simulação para testes sem API"""
        import random
        
        keywords = ['tampinha', 'garrafa', 'pet', 'reciclar', 'lixo', 'coletar']
        lower_description = challenge_description.lower()
        found_keywords = [kw for kw in keywords if kw in lower_description]
        
        # Confidence baseada em palavras-chave + fator aleatório
        base_confidence = min(0.3 + (len(found_keywords) * 0.15), 0.9)
        confidence = base_confidence + (random.random() * 0.1)
        
        return {
            'success': True,
            'confidence': round(confidence, 2),
            'analysis': f'[SIMULAÇÃO] Analisando desafio: "{challenge_description}". '
                       f'Palavras-chave encontradas: {found_keywords}. '
                       f'A imagem {"provavelmente corresponde" if confidence > 0.7 else "pode não corresponder"} '
                       f'ao desafio. Confidence: {confidence:.1%}',
            'provider': 'Simulação'
        }

    def analyze_challenge(self, image_url: str, challenge_description: str, use_simulation: bool = False) -> Dict[str, Any]:
        """Método principal para análise"""
        
        if use_simulation:
            return self.simulate_analysis(image_url, challenge_description)
        
        # Tenta Claude primeiro
        if self.anthropic_api_key:
            result = self.analyze_with_claude(image_url, challenge_description)
            if result.get('success'):
                return result
        
        # Fallback para OpenAI
        if self.openai_api_key:
            result = self.analyze_with_openai(image_url, challenge_description)
            if result.get('success'):
                return result
        
        # Se ambos falharam, usa simulação
        return self.simulate_analysis(image_url, challenge_description)

def main():
    parser = argparse.ArgumentParser(description='Analisa imagem para verificar desafio')
    parser.add_argument('--image-url', required=True, help='URL da imagem')
    parser.add_argument('--challenge', required=True, help='Descrição do desafio')
    parser.add_argument('--simulate', action='store_true', help='Usar simulação')
    
    args = parser.parse_args()
    
    analyzer = VisionAnalyzer()
    result = analyzer.analyze_challenge(
        args.image_url, 
        args.challenge, 
        args.simulate
    )
    
    # Retorna JSON para o NestJS
    print(json.dumps(result))

if __name__ == "__main__":
    main()