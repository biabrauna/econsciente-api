# Guia de Migração: MongoDB → PostgreSQL

Este guia descreve o processo completo de migração do banco de dados do MongoDB para PostgreSQL.

## 📋 Pré-requisitos

1. PostgreSQL instalado e rodando localmente
2. Backup do MongoDB (recomendado)
3. Node.js e npm instalados

## 🚀 Passo a Passo

### 1. Preparar o ambiente PostgreSQL

Certifique-se de que o PostgreSQL está rodando:

```bash
# Windows (usando pg_ctl)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Ou via serviços do Windows
# Procure por "PostgreSQL" nos serviços e inicie
```

Criar o banco de dados:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco
CREATE DATABASE fashionai_local;

# Sair
\q
```

### 2. Atualizar variáveis de ambiente

Edite o arquivo `.env` na pasta `econsciente-api`:

```env
# Manter a URL antiga do MongoDB para migração
MONGODB_URL=mongodb+srv://username:password@host/database?retryWrites=true&w=majority&appName=AppName

# Nova URL do PostgreSQL (substitui a antiga DATABASE_URL)
DATABASE_URL=postgresql://postgres:123456@localhost:5432/fashionai_local

# URL temporária para migração
POSTGRES_URL=postgresql://postgres:123456@localhost:5432/fashionai_local

# Demais configurações permanecem
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here_use_openssl_rand_base64_64
NODE_ENV=development
PORT=3002
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

### 3. Substituir o schema do Prisma

```bash
# Fazer backup do schema antigo
cd econsciente-api/prisma
copy schema.prisma schema-mongodb-backup.prisma

# Substituir pelo novo schema
copy schema-postgresql.prisma schema.prisma
```

### 4. Gerar o cliente Prisma e criar as tabelas

```bash
cd econsciente-api

# Gerar o cliente Prisma
npx prisma generate

# Criar as tabelas no PostgreSQL
npx prisma db push
```

### 5. Executar a migração de dados

```bash
# Executar o script de migração
npx ts-node scripts/migrate-to-postgresql.ts
```

O script irá:
- ✅ Conectar ao MongoDB e PostgreSQL
- ✅ Migrar todos os dados preservando relacionamentos
- ✅ Mapear ObjectIds para IDs inteiros
- ✅ Mostrar progresso e estatísticas

### 6. Verificar a migração

```bash
# Abrir Prisma Studio para visualizar os dados
npx prisma studio
```

Verifique se todos os dados foram migrados corretamente.

### 7. Testar a aplicação

```bash
# Iniciar o servidor
npm run start:dev
```

Teste as principais funcionalidades:
- Login/Registro
- Criar posts
- Curtir posts
- Comentários
- Desafios
- Conquistas

### 8. Remover configurações antigas (após confirmar que tudo funciona)

No `.env`, remover:
```env
MONGODB_URL=...  # Pode remover após confirmar que está tudo OK
POSTGRES_URL=... # Pode remover, mantendo apenas DATABASE_URL
```

## 🎯 Melhorias Implementadas

### Schema PostgreSQL Otimizado

1. **IDs Auto-incrementais**: Substituímos ObjectIds do MongoDB por IDs inteiros sequenciais
2. **Relacionamentos Explícitos**: Foreign keys com `onDelete: Cascade` para integridade referencial
3. **Tipos Otimizados**:
   - `BigInt` → `Int` (mais eficiente para contadores)
   - Campos de texto grandes com `@db.Text`
4. **Índices Estratégicos**: Mantidos e otimizados para PostgreSQL
5. **Nomenclatura Consistente**: Nomes de tabelas em snake_case

### Vantagens da Nova Estrutura

✅ **Performance**: PostgreSQL é geralmente mais rápido para queries complexas
✅ **ACID Completo**: Transações mais confiáveis
✅ **Economia**: Sem custos mensais rodando localmente
✅ **Relacionamentos**: Foreign keys garantem integridade dos dados
✅ **Ferramentas**: Melhor suporte de ferramentas SQL
✅ **Escalabilidade**: Mais fácil de otimizar e escalar

## 🔍 Verificação de Integridade

Execute estas queries no PostgreSQL para verificar os dados:

```sql
-- Contar registros
SELECT 'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comentarios', COUNT(*) FROM comentarios
UNION ALL
SELECT 'user_likes', COUNT(*) FROM user_likes
UNION ALL
SELECT 'desafios', COUNT(*) FROM desafios
UNION ALL
SELECT 'conquistas', COUNT(*) FROM conquistas;

-- Verificar relacionamentos
SELECT u.name, COUNT(p.id) as total_posts
FROM users u
LEFT JOIN posts p ON p."userId" = u.id
GROUP BY u.id, u.name
ORDER BY total_posts DESC
LIMIT 10;
```

## ⚠️ Troubleshooting

### Erro: "relation does not exist"

```bash
# Recriar as tabelas
npx prisma db push --force-reset
# Rodar migração novamente
npx ts-node scripts/migrate-to-postgresql.ts
```

### Erro de conexão com PostgreSQL

Verifique:
1. PostgreSQL está rodando?
2. Credenciais corretas no .env?
3. Firewall bloqueando porta 5432?

### Dados não aparecem

1. Verificar logs do script de migração
2. Verificar se MONGODB_URL está correto
3. Executar queries SQL de verificação

## 📊 Comparação de Performance

| Operação | MongoDB | PostgreSQL |
|----------|---------|------------|
| Custo mensal | R$ 50 | R$ 0 (local) |
| Queries complexas | Lento | Rápido |
| Integridade | Manual | Automática |
| Backup | Serviço pago | Dump local |

## 🎉 Conclusão

Após confirmar que tudo está funcionando:
1. ✅ Você pode desativar/cancelar o serviço MongoDB
2. ✅ Economizar R$ 50/mês
3. ✅ Ter controle total do banco local
4. ✅ Performance melhorada

Qualquer dúvida, consulte a documentação do Prisma: https://www.prisma.io/docs
