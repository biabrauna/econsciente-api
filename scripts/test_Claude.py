import requests

headers = {
    'x-api-key': 'SUA_CHAVE_API_AQUI',
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
}

payload = {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [
        {"role": "user", "content": "Olá, quem é você?"}
    ]
}

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers=headers,
    json=payload
)

print(response.status_code)
print(response.text)
