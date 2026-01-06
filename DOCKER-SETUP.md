# 🐳 Migração MongoDB → PostgreSQL (Docker)

## Setup Rápido com Docker

Você está usando Docker! Muito melhor! 🎉

### Passo 1: Iniciar PostgreSQL no Docker

```bash
cd econsciente-api

# Subir o PostgreSQL
docker-compose up -d

# Verificar se está rodando
docker ps
```

Você deverá ver algo como:
```
CONTAINER ID   IMAGE                 STATUS         PORTS
abc123         postgres:15-alpine    Up 10 seconds  0.0.0.0:5432->5432/tcp
```

### Passo 2: Verificar conexão

```bash
# Testar conexão
docker exec -it econsciente-postgres psql -U postgres -d fashionai_local -c "SELECT version();"
```

### Passo 3: Substituir schema do Prisma

```bash
cd prisma

# Backup do schema antigo
copy schema.prisma schema-mongodb-backup.prisma

# Usar o novo schema PostgreSQL
copy schema-postgresql.prisma schema.prisma
```

### Passo 4: Criar tabelas

```bash
cd ..
npm run prisma:migrate
```

### Passo 5: Migrar dados do MongoDB

```bash
npm run migrate:to-postgres
```

### Passo 6: Verificar dados

```bash
# Abrir Prisma Studio
npm run prisma:studio

# Ou via psql no Docker
docker exec -it econsciente-postgres psql -U postgres -d fashionai_local
```

No psql:
```sql
-- Ver todas as tabelas
\dt

-- Contar registros
SELECT 'users' as tabela, COUNT(*) FROM users
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'comentarios', COUNT(*) FROM comentarios;

-- Sair
\q
```

### Passo 7: Testar aplicação

```bash
npm run start:dev
```

## 🎯 Comandos úteis Docker

```bash
# Ver logs do PostgreSQL
docker logs econsciente-postgres

# Parar PostgreSQL
docker-compose down

# Parar e REMOVER dados (CUIDADO!)
docker-compose down -v

# Reiniciar PostgreSQL
docker-compose restart

# Entrar no container
docker exec -it econsciente-postgres bash

# Backup do banco
docker exec econsciente-postgres pg_dump -U postgres fashionai_local > backup.sql

# Restaurar backup
docker exec -i econsciente-postgres psql -U postgres fashionai_local < backup.sql
```

## 📊 Gerenciar dados

### Ver dados com Prisma Studio (recomendado)
```bash
npm run prisma:studio
```

### Ver dados com psql
```bash
docker exec -it econsciente-postgres psql -U postgres -d fashionai_local

# Queries úteis:
\dt                    # Listar tabelas
\d users              # Estrutura da tabela users
SELECT * FROM users;  # Ver usuários
```

### Conectar com cliente GUI (opcional)

Você pode usar qualquer cliente PostgreSQL:
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

**Configurações de conexão:**
- Host: `localhost`
- Port: `5432`
- Database: `fashionai_local`
- User: `postgres`
- Password: `123456`

## 🔧 Troubleshooting Docker

### Porta 5432 já em uso?

```bash
# Ver o que está usando a porta
netstat -ano | findstr :5432

# Mudar a porta no docker-compose.yml
ports:
  - "5433:5432"  # Usar 5433 no host

# Atualizar .env
DATABASE_URL="postgresql://postgres:123456@localhost:5433/fashionai_local"
```

### Container não inicia?

```bash
# Ver logs de erro
docker logs econsciente-postgres

# Remover container e volume, começar do zero
docker-compose down -v
docker-compose up -d
```

### Erro de conexão?

```bash
# Verificar se container está rodando
docker ps

# Verificar health do container
docker inspect econsciente-postgres | findstr Status

# Testar conexão diretamente
docker exec econsciente-postgres pg_isready -U postgres
```

## 💡 Vantagens do Docker

✅ **Isolado**: Não interfere com outras instalações
✅ **Portável**: Mesma configuração em qualquer máquina
✅ **Fácil reset**: `docker-compose down -v` e recomeça
✅ **Sem instalação**: Não precisa instalar PostgreSQL no sistema
✅ **Consistente**: Sempre a mesma versão (postgres:15-alpine)

## 🎉 Após migração bem-sucedida

1. **Remover MongoDB do .env:**
   ```bash
   # Deletar linha MONGODB_URL
   ```

2. **Cancelar MongoDB Atlas:**
   - Economize R$ 50/mês! 💰

3. **Fazer backup regular:**
   ```bash
   # Adicionar ao cron/agendador de tarefas
   docker exec econsciente-postgres pg_dump -U postgres fashionai_local > backup-$(date +%Y%m%d).sql
   ```

## 🚀 Arquitetura final

```
┌─────────────────┐
│  NestJS API     │
│  (port 3002)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  (Docker)       │
│  (port 5432)    │
└─────────────────┘
```

## 📝 Resumo dos comandos

```bash
# 1. Subir PostgreSQL
docker-compose up -d

# 2. Trocar schema
cd prisma && copy schema-postgresql.prisma schema.prisma && cd ..

# 3. Criar tabelas
npm run prisma:migrate

# 4. Migrar dados
npm run migrate:to-postgres

# 5. Ver dados
npm run prisma:studio

# 6. Iniciar API
npm run start:dev
```

**Pronto!** 🎉 Seu PostgreSQL está rodando no Docker e pronto para receber os dados!
