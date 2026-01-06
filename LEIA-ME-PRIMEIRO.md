# 📚 MIGRAÇÃO MONGODB → POSTGRESQL

## 🎯 Você está aqui!

Sua migração do MongoDB para PostgreSQL está **100% pronta para executar**!

## 📁 Arquivos Criados

### 🚀 Para Começar Agora
- **`QUICK-START-DOCKER.md`** ⭐ **COMECE AQUI!** (3 minutos com Docker)
- **`DOCKER-SETUP.md`** - Guia completo Docker com troubleshooting
- **`MIGRAR-AGORA.md`** - Guia rápido geral (5 minutos)

### 🔧 Configurações
- **`docker-compose.yml`** - Container PostgreSQL pronto
- **`.env`** - Já configurado com PostgreSQL
- **`package.json`** - Novos scripts npm adicionados

### 📦 Schema e Migração
- **`prisma/schema-postgresql.prisma`** - Novo schema otimizado
- **`scripts/migrate-to-postgresql.ts`** - Script de migração de dados
- **`scripts/init-db.sql`** - Inicialização do banco

### 📖 Documentação
- **`MIGRATION_GUIDE.md`** - Guia detalhado completo
- **`.env.postgres.example`** - Exemplo de configuração

## 🚀 Como Começar?

### Você usa Docker? (Recomendado) 🐳

**Leia:** `QUICK-START-DOCKER.md`

```bash
# Apenas 6 comandos!
cd econsciente-api
docker-compose up -d
cd prisma && copy schema-postgresql.prisma schema.prisma && cd ..
npm run prisma:migrate
npm run migrate:to-postgres
npm run start:dev
```

### Não usa Docker? 💻

**Leia:** `MIGRAR-AGORA.md`

## 💰 Economia

**MongoDB Atlas:** R$ 50/mês
**PostgreSQL Local/Docker:** R$ 0/mês
**Economia anual:** R$ 600! 🎉

## ✨ Melhorias Implementadas

### 1. Schema Otimizado
- ✅ IDs inteiros auto-incrementais (não mais ObjectId)
- ✅ Relacionamentos com Foreign Keys
- ✅ Integridade referencial (`onDelete: Cascade`)
- ✅ Índices otimizados para PostgreSQL
- ✅ Tipos adequados (Int, Text, Json)

### 2. Estrutura Relacional
```
User 1──→ N Posts
User 1──→ N Comentarios
User 1──→ N UserLikes
User 1──→ N ConquistaUsuario
Post 1──→ N Comentarios
Post 1──→ N UserLikes
...
```

### 3. Performance
- 🚀 Queries mais rápidas
- 🚀 Joins eficientes
- 🚀 Índices estratégicos
- 🚀 Tipos nativos PostgreSQL

### 4. Developer Experience
- 🎨 Prisma Studio para visualizar dados
- 🎨 Scripts npm simplificados
- 🎨 Docker Compose pronto
- 🎨 Documentação completa

## 🎯 Novos Comandos NPM

```bash
# Prisma
npm run prisma:generate    # Gerar cliente Prisma
npm run prisma:push        # Aplicar schema ao banco
npm run prisma:studio      # Abrir interface visual
npm run prisma:migrate     # Gerar + Push (completo)

# Migração
npm run migrate:to-postgres  # Migrar dados do MongoDB

# Docker
npm run docker:up          # Subir PostgreSQL
npm run docker:down        # Parar PostgreSQL
npm run docker:logs        # Ver logs
npm run docker:reset       # Reiniciar do zero
```

## 📊 Comparação Técnica

| Aspecto | MongoDB | PostgreSQL |
|---------|---------|------------|
| **Custo** | R$ 50/mês | R$ 0/mês |
| **IDs** | ObjectId (24 chars) | Integer |
| **Relacionamentos** | Manual | Foreign Keys |
| **Integridade** | Aplicação | Banco |
| **Transactions** | Limitado | ACID completo |
| **Joins** | Lookup lento | Joins nativos |
| **Backup** | Serviço pago | pg_dump grátis |
| **Ferramentas** | Limitadas | Ecossistema rico |

## 🔍 Estrutura do Projeto Após Migração

```
econsciente-api/
├── prisma/
│   ├── schema.prisma              # ← Novo schema PostgreSQL
│   └── schema-mongodb-backup.prisma # ← Backup do antigo
├── scripts/
│   ├── migrate-to-postgresql.ts   # ← Script de migração
│   ├── init-db.sql                # ← Init do Docker
│   └── setup-postgresql.bat       # ← Setup Windows
├── docker-compose.yml             # ← Docker PostgreSQL
├── .env                           # ← Atualizado
└── package.json                   # ← Novos scripts
```

## ⚡ Processo de Migração

```
MongoDB (Cloud)          PostgreSQL (Docker/Local)
     │                            │
     │  1. Ler dados             │
     ├──────────────────────────►│
     │                            │
     │  2. Mapear ObjectId → Int │
     │                            │
     │  3. Preservar relacionam. │
     │                            │
     │  4. Inserir dados         │
     ├──────────────────────────►│
     │                            │
     ✓  Migração completa         ✓
```

## 🛡️ Segurança

O script de migração:
- ✅ Preserva senhas criptografadas
- ✅ Mantém timestamps originais
- ✅ Respeita relacionamentos
- ✅ Trata duplicatas
- ✅ Mostra progresso detalhado

## 🎓 Aprendizados

### Antes (MongoDB)
```javascript
// ObjectId
user._id = "507f1f77bcf86cd799439011"

// Sem relacionamentos
posts.find({ userId: user._id })
```

### Depois (PostgreSQL)
```javascript
// Integer ID
user.id = 1

// Com relacionamentos
await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,        // Busca automática
    comentarios: true,  // Relacionamento direto
    likes: true         // Foreign keys
  }
})
```

## 📞 Próximos Passos

1. **Leia:** `QUICK-START-DOCKER.md` (se usa Docker) ou `MIGRAR-AGORA.md`
2. **Execute:** Os 6 comandos de migração
3. **Teste:** Sua aplicação
4. **Confirme:** Tudo funcionando
5. **Cancele:** MongoDB Atlas
6. **Economize:** R$ 50/mês! 💰

## 🆘 Precisa de Ajuda?

- **Guia rápido Docker:** `QUICK-START-DOCKER.md`
- **Guia rápido geral:** `MIGRAR-AGORA.md`
- **Docker detalhado:** `DOCKER-SETUP.md`
- **Guia completo:** `MIGRATION_GUIDE.md`

## 🎉 Vamos Começar!

**Abra agora:** `QUICK-START-DOCKER.md`

Sua migração vai levar apenas **3 minutos**! 🚀

---

**Dúvidas?** Todos os guias têm troubleshooting detalhado.

**Pronto?** Comece com `docker-compose up -d`! 🐳
