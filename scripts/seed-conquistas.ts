import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const conquistas = [
  {
    nome: 'Primeiro Passo Verde',
    descricao: 'Faça upload de sua primeira foto de perfil',
    icone: '🌱',
    tipo: 'perfil',
    criterio: JSON.stringify({ action: 'upload_profile_pic', amount: 1 }),
    pontosRecompensa: 10,
  },
  {
    nome: 'Identidade Ecológica',
    descricao: 'Complete sua biografia no perfil',
    icone: '📝',
    tipo: 'perfil',
    criterio: JSON.stringify({ action: 'update_bio', amount: 1 }),
    pontosRecompensa: 10,
  },
  {
    nome: 'Eco Iniciante',
    descricao: 'Complete seu primeiro desafio ecológico',
    icone: '✅',
    tipo: 'desafios',
    criterio: JSON.stringify({ action: 'complete_challenge', amount: 1 }),
    pontosRecompensa: 15,
  },
  {
    nome: 'Eco Comprometido',
    descricao: 'Complete 5 desafios ecológicos',
    icone: '🏅',
    tipo: 'desafios',
    criterio: JSON.stringify({ action: 'complete_challenge', amount: 5 }),
    pontosRecompensa: 50,
  },
  {
    nome: 'Eco Guerreiro',
    descricao: 'Complete 10 desafios ecológicos',
    icone: '⭐',
    tipo: 'desafios',
    criterio: JSON.stringify({ action: 'complete_challenge', amount: 10 }),
    pontosRecompensa: 100,
  },
  {
    nome: 'Voz Verde',
    descricao: 'Crie seu primeiro post',
    icone: '💬',
    tipo: 'social',
    criterio: JSON.stringify({ action: 'create_post', amount: 1 }),
    pontosRecompensa: 10,
  },
  {
    nome: 'Influencer Verde',
    descricao: 'Crie 10 posts',
    icone: '📢',
    tipo: 'social',
    criterio: JSON.stringify({ action: 'create_post', amount: 10 }),
    pontosRecompensa: 50,
  },
  {
    nome: 'Colecionador de Pontos',
    descricao: 'Acumule 100 pontos',
    icone: '💎',
    tipo: 'pontos',
    criterio: JSON.stringify({ action: 'earn_points', amount: 100 }),
    pontosRecompensa: 25,
  },
  {
    nome: 'Eco Mestre',
    descricao: 'Acumule 500 pontos',
    icone: '🏆',
    tipo: 'pontos',
    criterio: JSON.stringify({ action: 'earn_points', amount: 500 }),
    pontosRecompensa: 100,
  },
  {
    nome: 'Lenda Verde',
    descricao: 'Acumule 1000 pontos',
    icone: '👑',
    tipo: 'pontos',
    criterio: JSON.stringify({ action: 'earn_points', amount: 1000 }),
    pontosRecompensa: 200,
  },
];

async function seed() {
  console.log('🌱 Populando banco de dados com conquistas...');

  for (const conquista of conquistas) {
    const exists = await prisma.conquista.findUnique({
      where: { nome: conquista.nome },
    });

    if (!exists) {
      await prisma.conquista.create({ data: conquista });
      console.log(`✅ Conquista criada: ${conquista.nome}`);
    } else {
      console.log(`⏭️  Conquista já existe: ${conquista.nome}`);
    }
  }

  console.log('\n🎉 Seed completo! Total de conquistas:', conquistas.length);
  await prisma.$disconnect();
}

seed()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  });
