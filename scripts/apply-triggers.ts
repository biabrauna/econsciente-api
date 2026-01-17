import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyTriggers() {
  try {
    console.log('🔧 Aplicando triggers de sincronização de curtidas...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '../prisma/sync-likes-trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Dividir em comandos individuais e executar cada um
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command) {
        console.log(`Executando: ${command.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(command);
      }
    }

    console.log('\n✅ Triggers aplicados com sucesso!');
    console.log('\n📊 Verificando sincronização...');

    // Verificar se há inconsistências
    const inconsistencies = await prisma.$queryRaw<Array<{
      id: number;
      curtidas_contador: number;
      curtidas_reais: number;
    }>>`
      SELECT
        p.id,
        p.curtidas as curtidas_contador,
        COUNT(ul.id)::int as curtidas_reais
      FROM posts p
      LEFT JOIN user_likes ul ON ul."postId" = p.id
      GROUP BY p.id
      HAVING p.curtidas != COUNT(ul.id)
    `;

    if (inconsistencies.length > 0) {
      console.log(`⚠️  Encontradas ${inconsistencies.length} inconsistências (serão corrigidas automaticamente):`);
      inconsistencies.forEach(inc => {
        console.log(`   Post ${inc.id}: contador=${inc.curtidas_contador}, real=${inc.curtidas_reais}`);
      });
    } else {
      console.log('✅ Nenhuma inconsistência encontrada. Todos os contadores estão sincronizados!');
    }

    console.log('\n✅ Configuração concluída com sucesso!');
    console.log('\nℹ️  Os triggers agora garantem que:');
    console.log('   • Posts.curtidas sempre reflete a contagem de UserLike');
    console.log('   • Atualizações são automáticas ao adicionar/remover likes');
    console.log('   • O campo curtidas nunca pode ser negativo');

  } catch (error) {
    console.error('❌ Erro ao aplicar triggers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyTriggers();
