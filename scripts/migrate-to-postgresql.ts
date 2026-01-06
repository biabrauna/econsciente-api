import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env da pasta raiz do projeto (um nível acima)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Tentar também na pasta econsciente-api
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configurações
const MONGODB_URL = process.env.MONGODB_URL;
const POSTGRES_URL = process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/fashionai_local';

if (!MONGODB_URL) {
  console.error('❌ MONGODB_URL não configurada no .env');
  console.error('Adicione: MONGODB_URL="sua_url_mongodb_aqui"');
  process.exit(1);
}

interface IdMapping {
  [mongoId: string]: number;
}

const idMappings: {
  users: IdMapping;
  posts: IdMapping;
  desafios: IdMapping;
  conquistas: IdMapping;
} = {
  users: {},
  posts: {},
  desafios: {},
  conquistas: {},
};

async function migrateData() {
  console.log('🚀 Iniciando migração do MongoDB para PostgreSQL...\n');

  // Conectar ao MongoDB
  console.log('📦 Conectando ao MongoDB...');
  const mongoClient = new MongoClient(MONGODB_URL as string);
  await mongoClient.connect();
  const mongodb = mongoClient.db();
  console.log('✅ MongoDB conectado\n');

  // Conectar ao PostgreSQL via Prisma
  console.log('🐘 Conectando ao PostgreSQL...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: POSTGRES_URL,
      },
    },
  });
  await prisma.$connect();
  console.log('✅ PostgreSQL conectado\n');

  try {
    // 1. Migrar Users
    console.log('👥 Migrando usuários...');
    const users = await mongodb.collection('User').find().toArray();
    let userCount = 0;

    for (const user of users) {
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
          biografia: user.biografia || '',
          dataNascimento: new Date(user.dataNascimento),
          nivel: Number(user.nivel) || 1,
          pontos: Number(user.pontos) || 0,
          xp: Number(user.xp) || 0,
          seguidores: Number(user.seguidores) || 0,
          seguindo: Number(user.seguindo) || 0,
          onboardingCompleted: user.onboardingCompleted || false,
          onboardingSteps: user.onboardingSteps ? JSON.parse(user.onboardingSteps) : null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        },
      });
      idMappings.users[user._id.toString()] = newUser.id;
      userCount++;
    }
    console.log(`✅ ${userCount} usuários migrados\n`);

    // 2. Migrar ProfilePic
    console.log('🖼️  Migrando fotos de perfil...');
    const profilePics = await mongodb.collection('ProfilePic').find().toArray();
    let picCount = 0;

    for (const pic of profilePics) {
      const userId = idMappings.users[pic.userId?.toString()];
      if (userId) {
        await prisma.profilePic.create({
          data: {
            userId: userId,
            name: pic.name || null,
            url: pic.url,
          },
        });
        picCount++;
      }
    }
    console.log(`✅ ${picCount} fotos de perfil migradas\n`);

    // 3. Migrar Desafios
    console.log('🎯 Migrando desafios...');
    const desafios = await mongodb.collection('Desafios').find().toArray();
    let desafioCount = 0;

    for (const desafio of desafios) {
      const newDesafio = await prisma.desafios.create({
        data: {
          desafios: desafio.desafios,
          valor: Number(desafio.valor),
          createdAt: desafio.createdAt ? new Date(desafio.createdAt) : new Date(),
          updatedAt: desafio.updatedAt ? new Date(desafio.updatedAt) : new Date(),
        },
      });
      idMappings.desafios[desafio._id.toString()] = newDesafio.id;
      desafioCount++;
    }
    console.log(`✅ ${desafioCount} desafios migrados\n`);

    // 4. Migrar Posts
    console.log('📝 Migrando posts...');
    const posts = await mongodb.collection('Posts').find().toArray();
    let postCount = 0;

    for (const post of posts) {
      const userId = idMappings.users[post.userId?.toString()];
      const desafioId = post.desafioId ? idMappings.desafios[post.desafioId.toString()] : null;

      if (userId) {
        const newPost = await prisma.posts.create({
          data: {
            userId: userId,
            texto: post.texto,
            imagens: post.imagens || [],
            curtidas: post.curtidas || 0,
            comentarios: post.comentarios || 0,
            desafioId: desafioId || null,
            createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
          },
        });
        idMappings.posts[post._id.toString()] = newPost.id;
        postCount++;
      }
    }
    console.log(`✅ ${postCount} posts migrados\n`);

    // 5. Migrar Comentários
    console.log('💬 Migrando comentários...');
    const comentarios = await mongodb.collection('Comentario').find().toArray();
    let comentarioCount = 0;

    for (const comentario of comentarios) {
      const userId = idMappings.users[comentario.userId?.toString()];
      const postId = idMappings.posts[comentario.postId?.toString()];

      if (userId && postId) {
        await prisma.comentario.create({
          data: {
            userId: userId,
            postId: postId,
            userName: comentario.userName,
            texto: comentario.texto,
            createdAt: comentario.createdAt ? new Date(comentario.createdAt) : new Date(),
            updatedAt: comentario.updatedAt ? new Date(comentario.updatedAt) : new Date(),
          },
        });
        comentarioCount++;
      }
    }
    console.log(`✅ ${comentarioCount} comentários migrados\n`);

    // 6. Migrar UserLikes
    console.log('❤️  Migrando curtidas...');
    const likes = await mongodb.collection('UserLike').find().toArray();
    let likeCount = 0;

    for (const like of likes) {
      const userId = idMappings.users[like.userId?.toString()];
      const postId = idMappings.posts[like.postId?.toString()];

      if (userId && postId) {
        try {
          await prisma.userLike.create({
            data: {
              userId: userId,
              postId: postId,
              createdAt: like.createdAt ? new Date(like.createdAt) : new Date(),
            },
          });
          likeCount++;
        } catch (error) {
          // Ignora duplicatas
        }
      }
    }
    console.log(`✅ ${likeCount} curtidas migradas\n`);

    // 7. Migrar Conquistas
    console.log('🏆 Migrando conquistas...');
    const conquistas = await mongodb.collection('Conquista').find().toArray();
    let conquistaCount = 0;

    for (const conquista of conquistas) {
      const newConquista = await prisma.conquista.create({
        data: {
          nome: conquista.nome,
          descricao: conquista.descricao,
          icone: conquista.icone,
          tipo: conquista.tipo,
          criterio: conquista.criterio,
          pontosRecompensa: Number(conquista.pontosRecompensa),
          createdAt: conquista.createdAt ? new Date(conquista.createdAt) : new Date(),
          updatedAt: conquista.updatedAt ? new Date(conquista.updatedAt) : new Date(),
        },
      });
      idMappings.conquistas[conquista._id.toString()] = newConquista.id;
      conquistaCount++;
    }
    console.log(`✅ ${conquistaCount} conquistas migradas\n`);

    // 8. Migrar ConquistasUsuarios
    console.log('🎖️  Migrando conquistas dos usuários...');
    const conquistasUsuarios = await mongodb.collection('ConquistaUsuario').find().toArray();
    let conquistaUsuarioCount = 0;

    for (const cu of conquistasUsuarios) {
      const userId = idMappings.users[cu.userId?.toString()];
      const conquistaId = idMappings.conquistas[cu.conquistaId?.toString()];

      if (userId && conquistaId) {
        try {
          await prisma.conquistaUsuario.create({
            data: {
              userId: userId,
              conquistaId: conquistaId,
              desbloqueadaEm: cu.desbloqueadaEm ? new Date(cu.desbloqueadaEm) : new Date(),
            },
          });
          conquistaUsuarioCount++;
        } catch (error) {
          // Ignora duplicatas
        }
      }
    }
    console.log(`✅ ${conquistaUsuarioCount} conquistas de usuários migradas\n`);

    // 9. Migrar DesafiosConcluidos
    console.log('✔️  Migrando desafios concluídos...');
    const desafiosConcluidos = await mongodb.collection('DesafiosConcluidos').find().toArray();
    let desafioConcluidoCount = 0;

    for (const dc of desafiosConcluidos) {
      const userId = idMappings.users[dc.userId?.toString()];
      const desafioId = idMappings.desafios[dc.desafioId?.toString()];

      if (userId && desafioId) {
        try {
          await prisma.desafiosConcluidos.create({
            data: {
              userId: userId,
              desafioId: desafioId,
              completedAt: dc.completedAt ? new Date(dc.completedAt) : new Date(),
            },
          });
          desafioConcluidoCount++;
        } catch (error) {
          // Ignora duplicatas
        }
      }
    }
    console.log(`✅ ${desafioConcluidoCount} desafios concluídos migrados\n`);

    // 10. Migrar Follow
    console.log('👥 Migrando relações de seguir...');
    const follows = await mongodb.collection('Follow').find().toArray();
    let followCount = 0;

    for (const follow of follows) {
      const followerId = idMappings.users[follow.followerId?.toString()];
      const followingId = idMappings.users[follow.followingId?.toString()];

      if (followerId && followingId) {
        try {
          await prisma.follow.create({
            data: {
              followerId: followerId,
              followingId: followingId,
              createdAt: follow.createdAt ? new Date(follow.createdAt) : new Date(),
            },
          });
          followCount++;
        } catch (error) {
          // Ignora duplicatas
        }
      }
    }
    console.log(`✅ ${followCount} relações de seguir migradas\n`);

    // 11. Migrar Notificações
    console.log('🔔 Migrando notificações...');
    const notificacoes = await mongodb.collection('Notificacao').find().toArray();
    let notificacaoCount = 0;

    for (const notif of notificacoes) {
      const userId = idMappings.users[notif.userId?.toString()];

      if (userId) {
        await prisma.notificacao.create({
          data: {
            userId: userId,
            tipo: notif.tipo,
            mensagem: notif.mensagem,
            lida: notif.lida || false,
            createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date(),
          },
        });
        notificacaoCount++;
      }
    }
    console.log(`✅ ${notificacaoCount} notificações migradas\n`);

    // 12. Migrar Sessions
    console.log('🔐 Migrando sessões...');
    const sessions = await mongodb.collection('Session').find().toArray();
    let sessionCount = 0;

    for (const session of sessions) {
      const userId = idMappings.users[session.userId?.toString()];

      if (userId) {
        try {
          await prisma.session.create({
            data: {
              userId: userId,
              sessionToken: session.sessionToken,
              isActive: session.isActive || false,
              lastActivity: session.lastActivity ? new Date(session.lastActivity) : new Date(),
              expiresAt: session.expiresAt ? new Date(session.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              ipAddress: session.ipAddress || null,
              userAgent: session.userAgent || null,
              createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
            },
          });
          sessionCount++;
        } catch (error) {
          // Ignora duplicatas de sessionToken
        }
      }
    }
    console.log(`✅ ${sessionCount} sessões migradas\n`);

    console.log('\n✨ Migração concluída com sucesso! ✨\n');
    console.log('📊 Resumo:');
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Fotos de perfil: ${picCount}`);
    console.log(`   - Posts: ${postCount}`);
    console.log(`   - Comentários: ${comentarioCount}`);
    console.log(`   - Curtidas: ${likeCount}`);
    console.log(`   - Desafios: ${desafioCount}`);
    console.log(`   - Desafios concluídos: ${desafioConcluidoCount}`);
    console.log(`   - Conquistas: ${conquistaCount}`);
    console.log(`   - Conquistas de usuários: ${conquistaUsuarioCount}`);
    console.log(`   - Relações de seguir: ${followCount}`);
    console.log(`   - Notificações: ${notificacaoCount}`);
    console.log(`   - Sessões: ${sessionCount}`);

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
  }
}

// Executar migração
migrateData()
  .then(() => {
    console.log('\n✅ Processo finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
