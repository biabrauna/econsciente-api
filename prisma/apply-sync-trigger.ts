import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Aplicando migration para sincronização de curtidas...');

  const sqlPath = path.join(__dirname, 'sync-likes-trigger.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Split by semicolon to execute each statement separately
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.length > 0) {
      console.log('Executando statement...');
      await prisma.$executeRawUnsafe(statement);
    }
  }

  console.log('✅ Migration aplicada com sucesso!');
  console.log('✅ Triggers criados para sincronização automática');
  console.log('✅ Dados existentes sincronizados');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao aplicar migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
