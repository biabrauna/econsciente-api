import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const postsExemplo = [
  {
    url: 'https://res.cloudinary.com/dnulz0tix/image/upload/v1733820561/exayhaa5rngll7qs8acq.png',
    likes: 42,
  },
  {
    url: 'https://res.cloudinary.com/dnulz0tix/image/upload/v1733820561/cqmpjredic5wuyiow5ob.png',
    likes: 38,
  },
  {
    url: 'https://res.cloudinary.com/dnulz0tix/image/upload/v1733820561/fjbwpp3ooixkmnmxfljm.jpg',
    likes: 31,
  },
  {
    url: 'https://res.cloudinary.com/dnulz0tix/image/upload/v1733802865/i6kojbxaeh39jcjqo3yh.png',
    likes: 25,
  },
  {
    url: 'https://res.cloudinary.com/dnulz0tix/image/upload/v1733821330/khkunz0zbgkhuhqugvqc.png',
    likes: 19,
  },
];

async function seedPosts() {
  console.log('🌱 Iniciando seed de posts...');

  try {
    // Buscar os 3 primeiros usuários
    const users = await prisma.user.findMany({
      take: 3,
      select: { id: true, name: true },
    });

    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado. Crie usuários primeiro!');
      return;
    }

    console.log(`👥 Encontrados ${users.length} usuários`);

    // Criar posts para cada usuário
    let postsCreated = 0;
    for (const user of users) {
      // Criar 2 posts por usuário usando diferentes imagens
      const startIndex = postsCreated % postsExemplo.length;

      for (let i = 0; i < 2; i++) {
        const postData = postsExemplo[(startIndex + i) % postsExemplo.length];

        await prisma.posts.create({
          data: {
            userId: user.id,
            url: postData.url,
            likes: postData.likes + Math.floor(Math.random() * 10), // Varia um pouco
          },
        });

        postsCreated++;
        console.log(`✅ Post ${postsCreated} criado para ${user.name}`);
      }
    }

    console.log(`\n🎉 Seed concluído! ${postsCreated} posts criados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao criar posts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPosts()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
