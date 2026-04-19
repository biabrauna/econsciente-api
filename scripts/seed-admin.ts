import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'biabn442@gmail.com';
  const password = await bcrypt.hash('EcoRoot#2024', 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ROOT' },
    create: {
      email,
      password,
      name: 'Bia Braunal',
      biografia: 'Administradora da plataforma',
      dataNascimento: new Date('2000-05-15'),
      role: 'ROOT',
      onboardingCompleted: true,
    },
  });

  console.log(`✅ Admin criado/atualizado: ${admin.email} (role: ${admin.role})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
