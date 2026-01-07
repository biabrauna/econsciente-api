const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTables() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('✅ Tables in PostgreSQL database:');
    tables.forEach(t => console.log('   - ' + t.table_name));
    console.log(`\n✅ Total: ${tables.length} tables created`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
    process.exit(1);
  }
}

verifyTables();
