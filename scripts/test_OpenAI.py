import requests
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}

payload = {
    "model": "gpt-4-vision-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "O que aparece nesta imagem?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Golde33443.jpg/640px-Golde33443.jpg",
                        "detail": "low"
                    }
                },
            ],
        }
    ],
    "max_tokens": 100,
}

response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

print(response.status_code)
print(response.json())
