import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkCounts() {
  console.log('📊 Verificando totais no PostgreSQL...\n');

  console.log('Tabela                      | Total');
  console.log('--------------------------- | -----');

  const users = await prisma.user.count();
  console.log(`users                       | ${users}`);

  const posts = await prisma.posts.count();
  console.log(`posts                       | ${posts}`);

  const comentarios = await prisma.comentario.count();
  console.log(`comentarios                 | ${comentarios}`);

  const likes = await prisma.userLike.count();
  console.log(`user_likes                  | ${likes}`);

  const desafios = await prisma.desafios.count();
  console.log(`desafios                    | ${desafios}`);

  const desafiosConcluidos = await prisma.desafiosConcluidos.count();
  console.log(`desafios_concluidos         | ${desafiosConcluidos}`);

  const conquistas = await prisma.conquista.count();
  console.log(`conquistas                  | ${conquistas}`);

  const conquistasUsuarios = await prisma.conquistaUsuario.count();
  console.log(`conquistas_usuarios         | ${conquistasUsuarios}`);

  const follows = await prisma.follow.count();
  console.log(`follows                     | ${follows}`);

  const notificacoes = await prisma.notificacao.count();
  console.log(`notificacoes                | ${notificacoes}`);

  const sessions = await prisma.session.count();
  console.log(`sessions                    | ${sessions}`);

  const profilePics = await prisma.profilePic.count();
  console.log(`profile_pics                | ${profilePics}`);

  await prisma.$disconnect();
  console.log('\n✅ Verificação concluída!');
}

checkCounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
