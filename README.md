# EcoConsciente API

API RESTful para o sistema EcoConsciente - plataforma de desafios ambientais e sustentabilidade.

## 🌿 Sobre o Projeto

EcoConsciente é uma plataforma que gamifica ações sustentáveis através de desafios ambientais. Os usuários podem completar desafios, ganhar pontos, compartilhar posts e usar visão computacional para validar suas conquistas.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **NestJS** - Framework backend
- **Prisma** - ORM para MongoDB
- **MongoDB** - Banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Python** - Scripts de visão computacional (OpenAI/Anthropic)
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x
- MongoDB (local ou Atlas)
- Python 3.x (para módulo de visão)

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd econsciente-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@host/database?retryWrites=true&w=majority&appName=AppName"

# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration (gere um secret forte)
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=development
PORT=3000

# CORS Origins (separados por vírgula)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# Python Configuration
PYTHON_EXECUTABLE=python3
```

**⚠️ IMPORTANTE:** Gere um JWT_SECRET seguro usando:

```bash
openssl rand -base64 64
```

### 4. Configure o Prisma

Gere o cliente Prisma:

```bash
npx prisma generate
```

## 🏃 Executando a Aplicação

### Modo desenvolvimento

```bash
npm run start:dev
```

### Modo produção

```bash
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação Swagger em:

```
http://localhost:3000/api-docs
```

## 🔐 Autenticação

A API usa autenticação JWT (JSON Web Token). Para acessar rotas protegidas:

1. Faça registro: `POST /auth/register`
2. Faça login: `POST /auth/login`
3. Use o `access_token` retornado no header `Authorization: Bearer {token}`

## 📍 Endpoints Principais

### Autenticação

- `POST /auth/register` - Criar nova conta
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Obter dados do usuário autenticado

### Usuários

- `GET /usuarios` - Listar usuários (paginado)
- `GET /usuarios/:id` - Buscar usuário por ID
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Deletar usuário

### Desafios

- `GET /desafios` - Listar desafios (paginado)
- `POST /desafios` - Criar novo desafio
- `POST /desafios/concluidos` - Marcar desafio como concluído
- `GET /desafios/search?search=termo` - Buscar desafios

### Posts

- `GET /posts` - Listar posts (paginado)
- `POST /posts` - Criar novo post

### Visão Computacional

- `POST /vision/verify-challenge` - Verificar conclusão de desafio via imagem

## 🎯 Funcionalidades

- ✅ Sistema completo de autenticação com JWT
- ✅ CRUD de usuários, desafios e posts
- ✅ Paginação em todas as listagens
- ✅ Validação de dados com class-validator
- ✅ Rate limiting (10 requisições/minuto)
- ✅ Tratamento global de exceções
- ✅ Logging customizado
- ✅ Relacionamentos e índices no banco
- ✅ Validação de imagens com IA (OpenAI/Anthropic)
- ✅ Documentação Swagger completa
- ✅ TypeScript com strict mode

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test
npm run test:cov

# Linting
npm run lint

# Formatação
npm run format

# Prisma
npx prisma generate      # Gerar cliente
npx prisma db push       # Aplicar schema no banco
npx prisma studio        # Interface visual do banco
```

## 🏗️ Estrutura do Projeto

```
src/
├── auth/              # Autenticação e autorização
├── common/            # Código compartilhado
│   ├── decorators/    # Decorators customizados
│   ├── dto/           # DTOs comuns (paginação)
│   ├── filters/       # Filtros de exceção
│   ├── interceptors/  # Interceptors
│   ├── interfaces/    # Interfaces TypeScript
│   └── logger/        # Logger customizado
├── desafios/          # Módulo de desafios
├── posts/             # Módulo de posts
├── prisma/            # Configuração Prisma
├── profile-pic/       # Fotos de perfil
├── users/             # Módulo de usuários
├── vision/            # Visão computacional
├── app.module.ts      # Módulo raiz
└── main.ts            # Bootstrap da aplicação
```

## 🗄️ Modelos do Banco de Dados

### User

- Email, nome, idade, biografia
- Pontos, seguidores, seguindo
- Relacionamentos: posts, profile pics, desafios concluídos

### Desafios

- Descrição e valor em pontos
- Relacionamento com desafios concluídos

### Posts

- URL da imagem e likes
- Pertence a um usuário

### ProfilePic

- Foto de perfil do usuário (única por usuário)

### DesafiosConcluidos

- Vínculo entre usuário e desafio completado

## 🛡️ Segurança

- ✅ Senhas criptografadas com bcrypt (salt rounds: 12)
- ✅ JWT com expiração de 1h
- ✅ Rate limiting global
- ✅ Validação de entrada em todos os endpoints
- ✅ CORS configurável por ambiente
- ✅ Variáveis sensíveis em .env (não commitadas)

## 🐛 Resolução de Problemas

### Erro de conexão com MongoDB

Verifique se a `DATABASE_URL` está correta no `.env`

### Python não encontrado (Vision module)

Configure `PYTHON_EXECUTABLE=python` no `.env` (Windows) ou `python3` (Linux/Mac)

### Erro de validação JWT

Certifique-se que o `JWT_SECRET` está configurado no `.env`

## 📝 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

## 👥 Autores

EcoConsciente Team

---

**Desenvolvido com ❤️ para um planeta mais sustentável 🌍**
