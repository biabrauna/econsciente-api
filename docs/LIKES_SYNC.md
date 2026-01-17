# Sincronização de Curtidas em Posts

## Problema

Os endpoints `/posts/:postId/like` e `/posts/:postId/unlike` utilizam a tabela `UserLike` para rastrear curtidas individuais, mas o campo `Posts.curtidas` precisa estar sempre sincronizado com a contagem real de `UserLike.postId`.

## Solução Implementada

A solução utiliza **triggers do PostgreSQL** para garantir a sincronização automática e consistente entre as tabelas.

### 1. Triggers do Banco de Dados

Arquivo: `prisma/sync-likes-trigger.sql`

O script SQL implementa:

- **Correção de inconsistências existentes**: Atualiza todos os contadores para refletir a contagem real
- **Trigger de INSERT**: Atualiza `Posts.curtidas` quando um like é adicionado
- **Trigger de DELETE**: Atualiza `Posts.curtidas` quando um like é removido
- **Constraint de validação**: Garante que `curtidas` nunca seja negativo

### 2. Aplicação dos Triggers

Para aplicar os triggers ao banco de dados:

```bash
npm run db:apply-triggers
```

Este script:
- Executa o SQL de criação dos triggers
- Verifica e corrige inconsistências existentes
- Reporta o status da sincronização

### 3. Como Funciona

#### Antes (Manual - Propenso a erros)
```typescript
// O desenvolvedor precisa lembrar de atualizar o contador
await prisma.posts.update({
  where: { id: postId },
  data: { curtidas: { increment: 1 } }
});
```

#### Depois (Automático - À prova de erros)
```typescript
// Apenas criar/deletar o UserLike
await prisma.userLike.create({
  data: { userId, postId }
});
// O trigger atualiza Posts.curtidas automaticamente!
```

### 4. Benefícios

✅ **Consistência Garantida**: Triggers executam atomicamente na transação
✅ **Sem Código Extra**: Não precisa lembrar de atualizar contadores manualmente
✅ **Performance**: Atualização em nível de banco é mais eficiente
✅ **Prova de Bugs**: Impossível dessincronizar, mesmo com erros de código
✅ **Auditável**: Fácil verificar se há inconsistências

### 5. Verificação

Para verificar se há inconsistências:

```sql
SELECT
  p.id,
  p.curtidas as contador,
  COUNT(ul.id) as real
FROM posts p
LEFT JOIN user_likes ul ON ul."postId" = p.id
GROUP BY p.id
HAVING p.curtidas != COUNT(ul.id);
```

Se retornar vazio, tudo está sincronizado! ✅

### 6. Código do Service

O código em `posts.service.ts` já está preparado para usar os triggers:

```typescript
async likePost(postId: number, userId: number) {
  return this.prisma.$transaction(async (tx) => {
    // Criar like - trigger atualiza curtidas automaticamente
    await tx.userLike.create({
      data: { userId, postId }
    });

    // Buscar post já com contador atualizado
    return tx.posts.findUnique({
      where: { id: postId },
      include: { userLikes: true }
    });
  });
}
```

## Manutenção

- **Novos ambientes**: Execute `npm run db:apply-triggers` após setup do banco
- **Migrations**: O script é idempotente, pode ser executado múltiplas vezes
- **Rollback**: Para remover os triggers, delete-os no PostgreSQL:
  ```sql
  DROP TRIGGER IF EXISTS trigger_sync_likes_insert ON user_likes;
  DROP TRIGGER IF EXISTS trigger_sync_likes_delete ON user_likes;
  ```

## Testes

Para testar a sincronização:

1. Curtir um post: `PATCH /posts/:postId/like`
2. Verificar que `curtidas` incrementou
3. Descurtir: `PATCH /posts/:postId/unlike`
4. Verificar que `curtidas` decrementou
5. Executar query de verificação acima
