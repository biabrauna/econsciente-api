# 🐳 MIGRAÇÃO EXPRESS - 3 MINUTOS COM DOCKER

## Comandos para copiar e colar:

### 1️⃣ Subir PostgreSQL
```bash
cd econsciente-api
docker-compose up -d
docker ps
```

### 2️⃣ Trocar Schema
```bash
cd prisma
copy schema.prisma schema-mongodb-backup.prisma
copy schema-postgresql.prisma schema.prisma
cd ..
```

### 3️⃣ Criar Tabelas
```bash
npm run prisma:migrate
```

### 4️⃣ Migrar Dados
```bash
npm run migrate:to-postgres
```

### 5️⃣ Ver Resultados
```bash
npm run prisma:studio
```

### 6️⃣ Testar
```bash
npm run start:dev
```

## ✅ Pronto!

Acesse: http://localhost:3002/api

## 🎯 Comandos Úteis

```bash
# Ver logs do PostgreSQL
npm run docker:logs

# Parar PostgreSQL
npm run docker:down

# Reiniciar do zero (CUIDADO: apaga dados)
npm run docker:reset

# Entrar no container
docker exec -it econsciente-postgres bash

# Consultar dados
docker exec -it econsciente-postgres psql -U postgres -d fashionai_local
```

## 💾 Backup Rápido

```bash
# Fazer backup
docker exec econsciente-postgres pg_dump -U postgres fashionai_local > backup.sql

# Restaurar backup
docker exec -i econsciente-postgres psql -U postgres fashionai_local < backup.sql
```

## 📊 Informações da Conexão

- **Host:** localhost
- **Porta:** 5432
- **Database:** fashionai_local
- **User:** postgres
- **Password:** 123456

**URL completa:**
```
postgresql://postgres:123456@localhost:5432/fashionai_local
```

## 🎉 Depois de Confirmar

1. Remover do `.env`:
   ```
   MONGODB_URL="..."  # Deletar esta linha
   ```

2. Cancelar MongoDB Atlas → Economize R$ 50/mês! 💰

---

**Problemas?** Veja `DOCKER-SETUP.md` para troubleshooting detalhado.
