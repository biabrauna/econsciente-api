# 🚀 Migração MongoDB → PostgreSQL - PASSO A PASSO RÁPIDO

## ✅ O que já foi feito

- ✅ Schema PostgreSQL otimizado criado
- ✅ Script de migração de dados pronto
- ✅ Arquivo .env configurado
- ✅ Docker Compose configurado 🐳
- ✅ Documentação completa
- ✅ Scripts auxiliares criados

## 🐳 VOCÊ USA DOCKER (Recomendado)

### Passo 1: Subir PostgreSQL no Docker

```bash
cd econsciente-api

# Subir o container PostgreSQL
docker-compose up -d

# Verificar se está rodando
docker ps
```

### Passo 2: Pular para o Passo 3 abaixo! ⬇️

---

## 💻 OU - Se NÃO usa Docker

### Passo 1: Instalar PostgreSQL

**Windows:**
```powershell
# Download: https://www.postgresql.org/download/windows/
# Durante instalação, use senha: 123456
```

**Verificar:**
```bash
psql --version
```

### Passo 2: Criar banco de dados

```bash
cd econsciente-api
scripts\setup-postgresql.bat
```

---

## 📝 Continuar (para todos)

### Passo 3: Substituir schema do Prisma

```bash
cd econsciente-api\prisma
copy schema.prisma schema-mongodb-backup.prisma
copy schema-postgresql.prisma schema.prisma
```

### Passo 4: Gerar cliente Prisma e criar tabelas

```bash
cd econsciente-api
npm run prisma:migrate
```

Isso irá:
- Gerar o cliente Prisma
- Criar todas as tabelas no PostgreSQL

### Passo 5: Migrar os dados do MongoDB

```bash
npm run migrate:to-postgres
```

Aguarde... O script mostrará o progresso:
- 👥 Migrando usuários...
- 📝 Migrando posts...
- 💬 Migrando comentários...
- etc.

### Passo 6: Verificar os dados

```bash
npm run prisma:studio
```

Isso abre uma interface visual para ver seus dados migrados!

### Passo 7: Testar a aplicação

```bash
npm run start:dev
```

Acesse: http://localhost:3002/api

Teste:
- Login
- Criar posts
- Comentários
- Curtidas

## 🎉 Após confirmar que tudo funciona

1. **Remova do .env:**
   ```env
   # Deletar esta linha:
   MONGODB_URL="mongodb+srv://..."
   ```

2. **Cancele o MongoDB Atlas:**
   - Acesse https://cloud.mongodb.com
   - Pause ou delete o cluster
   - **Economize R$ 50/mês!** 💰

## 🆘 Problemas?

### Erro: "relation does not exist"
```bash
npm run prisma:migrate
```

### Erro: "Cannot connect to PostgreSQL"
Verifique se o PostgreSQL está rodando:
```powershell
# Windows - Serviços
services.msc
# Procure "postgresql" e inicie
```

### Dados não migraram
Verifique o MONGODB_URL no .env e rode novamente:
```bash
npm run migrate:to-postgres
```

## 📊 Resumo dos arquivos criados

- ✅ `prisma/schema-postgresql.prisma` - Novo schema
- ✅ `scripts/migrate-to-postgresql.ts` - Script de migração
- ✅ `scripts/setup-postgresql.bat` - Setup automático
- ✅ `MIGRATION_GUIDE.md` - Guia completo (detalhado)
- ✅ `.env` - Atualizado com PostgreSQL
- ✅ `package.json` - Novos scripts adicionados

## 🎯 Comandos úteis

```bash
# Ver dados no navegador
npm run prisma:studio

# Reiniciar banco (CUIDADO: apaga tudo)
npx prisma db push --force-reset

# Migrar dados novamente
npm run migrate:to-postgres

# Iniciar servidor
npm run start:dev
```

## 💡 Benefícios da migração

- ✅ R$ 0/mês vs R$ 50/mês
- ✅ Banco local = mais rápido
- ✅ Relacionamentos garantidos (Foreign Keys)
- ✅ Queries SQL mais eficientes
- ✅ Controle total dos dados
- ✅ Backup fácil (pg_dump)

---

**Dúvidas?** Consulte `MIGRATION_GUIDE.md` para informações detalhadas.

**Pronto para começar?** Execute o Passo 1! 🚀
