import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const count = await prisma.desafios.count();
  console.log('Total desafios no banco:', count);

  const desafios = await prisma.desafios.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  console.log('\nPrimeiros 5 desafios:');
  desafios.forEach((d, i) => {
    console.log(`${i + 1}. ${d.desafios} (${d.valor} pontos)`);
  });

  await prisma.$disconnect();
}

verify();
