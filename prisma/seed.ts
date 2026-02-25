import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Populando banco de dados...\n');

  // ========== USUARIOS ==========
  const senhaHash = await bcrypt.hash('123456', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'bia@email.com' },
      update: {},
      create: {
        email: 'bia@email.com',
        password: senhaHash,
        name: 'Bia Braunal',
        biografia: 'Apaixonada por sustentabilidade e natureza',
        dataNascimento: new Date('2000-05-15'),
        nivel: 3,
        pontos: 150,
        xp: 320,
        onboardingCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'lucas@email.com' },
      update: {},
      create: {
        email: 'lucas@email.com',
        password: senhaHash,
        name: 'Lucas Silva',
        biografia: 'Reciclando e mudando o mundo, um passo de cada vez',
        dataNascimento: new Date('1998-11-20'),
        nivel: 2,
        pontos: 85,
        xp: 180,
        onboardingCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@email.com' },
      update: {},
      create: {
        email: 'maria@email.com',
        password: senhaHash,
        name: 'Maria Santos',
        biografia: 'Vegana, ciclista e ativista ambiental',
        dataNascimento: new Date('2001-03-08'),
        nivel: 5,
        pontos: 420,
        xp: 890,
        onboardingCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'pedro@email.com' },
      update: {},
      create: {
        email: 'pedro@email.com',
        password: senhaHash,
        name: 'Pedro Oliveira',
        biografia: 'Biólogo e amante da fauna brasileira',
        dataNascimento: new Date('1999-07-22'),
        nivel: 4,
        pontos: 280,
        xp: 610,
        onboardingCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana@email.com' },
      update: {},
      create: {
        email: 'ana@email.com',
        password: senhaHash,
        name: 'Ana Costa',
        biografia: 'Engenheira ambiental em formacao',
        dataNascimento: new Date('2002-01-10'),
        nivel: 1,
        pontos: 30,
        xp: 45,
        onboardingCompleted: false,
      },
    }),
  ]);

  console.log(`${users.length} usuarios criados (senha: 123456)`);

  // ========== DESAFIOS ==========
  const desafiosData = [
    { desafios: 'Usar garrafa reutilizavel por uma semana', valor: 20 },
    { desafios: 'Separar o lixo reciclavel por 3 dias consecutivos', valor: 15 },
    { desafios: 'Nao usar plastico descartavel por um dia', valor: 10 },
    { desafios: 'Fazer compostagem de residuos organicos', valor: 25 },
    { desafios: 'Usar transporte publico ou bicicleta por uma semana', valor: 30 },
    { desafios: 'Desligar aparelhos da tomada quando nao estiver usando', valor: 10 },
    { desafios: 'Tomar banhos de no maximo 5 minutos por 3 dias', valor: 15 },
    { desafios: 'Plantar uma arvore ou cultivar uma planta', valor: 25 },
    { desafios: 'Fazer uma refeicao sem carne (segunda sem carne)', valor: 10 },
    { desafios: 'Reutilizar sacolas de pano para compras', valor: 10 },
    { desafios: 'Criar um produto a partir de material reciclado', valor: 30 },
    { desafios: 'Organizar uma limpeza em area publica (praia, parque)', valor: 40 },
    { desafios: 'Reduzir o consumo de papel usando anotacoes digitais', valor: 15 },
    { desafios: 'Compartilhar conhecimento sobre sustentabilidade com 3 pessoas', valor: 20 },
    { desafios: 'Usar produtos de limpeza ecologicos por uma semana', valor: 20 },
    { desafios: 'Consertar algo em vez de jogar fora', valor: 15 },
    { desafios: 'Comprar produtos locais e da estacao', valor: 15 },
    { desafios: 'Evitar fast fashion - nao comprar roupas novas por um mes', valor: 35 },
    { desafios: 'Fazer uma doacao de itens que voce nao usa mais', valor: 20 },
    { desafios: 'Usar iluminacao natural durante o dia', valor: 10 },
  ];

  let desafiosCriados = 0;
  const desafios = [];
  for (const d of desafiosData) {
    const existing = await prisma.desafios.findFirst({ where: { desafios: d.desafios } });
    if (existing) {
      desafios.push(existing);
    } else {
      const created = await prisma.desafios.create({ data: d });
      desafios.push(created);
      desafiosCriados++;
    }
  }
  console.log(`${desafiosCriados} desafios criados (${desafios.length} total)`);

  // ========== CONQUISTAS ==========
  const conquistasData = [
    { nome: 'Primeiro Passo Verde', descricao: 'Faca upload de sua primeira foto de perfil', icone: 'leaf', tipo: 'perfil', criterio: JSON.stringify({ action: 'upload_profile_pic', amount: 1 }), pontosRecompensa: 10 },
    { nome: 'Identidade Ecologica', descricao: 'Complete sua biografia no perfil', icone: 'pencil', tipo: 'perfil', criterio: JSON.stringify({ action: 'update_bio', amount: 1 }), pontosRecompensa: 10 },
    { nome: 'Eco Iniciante', descricao: 'Complete seu primeiro desafio ecologico', icone: 'check', tipo: 'desafios', criterio: JSON.stringify({ action: 'complete_challenge', amount: 1 }), pontosRecompensa: 15 },
    { nome: 'Eco Comprometido', descricao: 'Complete 5 desafios ecologicos', icone: 'medal', tipo: 'desafios', criterio: JSON.stringify({ action: 'complete_challenge', amount: 5 }), pontosRecompensa: 50 },
    { nome: 'Eco Guerreiro', descricao: 'Complete 10 desafios ecologicos', icone: 'star', tipo: 'desafios', criterio: JSON.stringify({ action: 'complete_challenge', amount: 10 }), pontosRecompensa: 100 },
    { nome: 'Voz Verde', descricao: 'Crie seu primeiro post', icone: 'chat', tipo: 'social', criterio: JSON.stringify({ action: 'create_post', amount: 1 }), pontosRecompensa: 10 },
    { nome: 'Influencer Verde', descricao: 'Crie 10 posts', icone: 'megaphone', tipo: 'social', criterio: JSON.stringify({ action: 'create_post', amount: 10 }), pontosRecompensa: 50 },
    { nome: 'Colecionador de Pontos', descricao: 'Acumule 100 pontos', icone: 'gem', tipo: 'pontos', criterio: JSON.stringify({ action: 'earn_points', amount: 100 }), pontosRecompensa: 25 },
    { nome: 'Eco Mestre', descricao: 'Acumule 500 pontos', icone: 'trophy', tipo: 'pontos', criterio: JSON.stringify({ action: 'earn_points', amount: 500 }), pontosRecompensa: 100 },
    { nome: 'Lenda Verde', descricao: 'Acumule 1000 pontos', icone: 'crown', tipo: 'pontos', criterio: JSON.stringify({ action: 'earn_points', amount: 1000 }), pontosRecompensa: 200 },
  ];

  let conquistasCriadas = 0;
  const conquistas = [];
  for (const c of conquistasData) {
    const existing = await prisma.conquista.findUnique({ where: { nome: c.nome } });
    if (existing) {
      conquistas.push(existing);
    } else {
      const created = await prisma.conquista.create({ data: c });
      conquistas.push(created);
      conquistasCriadas++;
    }
  }
  console.log(`${conquistasCriadas} conquistas criadas (${conquistas.length} total)`);

  // ========== POSTS ==========
  const postsData = [
    { userId: users[0].id, texto: 'Comecei a usar minha garrafa reutilizavel hoje! Menos plastico no mundo.', imagens: [], desafioId: desafios[0].id },
    { userId: users[0].id, texto: 'Fiz compostagem pela primeira vez, olha o resultado!', imagens: [], desafioId: desafios[3].id },
    { userId: users[1].id, texto: 'Uma semana inteira indo de bike pro trabalho. O corpo e o planeta agradecem!', imagens: [], desafioId: desafios[4].id },
    { userId: users[1].id, texto: 'Dica: guardem potes de vidro, da pra reutilizar pra tudo!', imagens: [] },
    { userId: users[2].id, texto: 'Organizamos uma limpeza na praia hoje. Recolhemos 15kg de lixo!', imagens: [], desafioId: desafios[11].id },
    { userId: users[2].id, texto: 'Receita vegana do dia: hamburguer de grao de bico. Delicioso e sustentavel!', imagens: [], desafioId: desafios[8].id },
    { userId: users[2].id, texto: 'Minha horta urbana esta crescendo! Tomates, manjericao e cebolinha.', imagens: [], desafioId: desafios[7].id },
    { userId: users[3].id, texto: 'Consertei minha mochila velha em vez de comprar uma nova. Ficou otima!', imagens: [], desafioId: desafios[15].id },
    { userId: users[3].id, texto: 'Fiz uma doacao de roupas que nao usava mais. Liberdade!', imagens: [], desafioId: desafios[18].id },
    { userId: users[4].id, texto: 'Primeiro dia sem plastico descartavel! Foi mais facil do que eu pensava.', imagens: [], desafioId: desafios[2].id },
  ];

  const posts = [];
  for (const p of postsData) {
    const post = await prisma.posts.create({ data: p });
    posts.push(post);
  }
  console.log(`${posts.length} posts criados`);

  // ========== COMENTARIOS ==========
  const comentariosData = [
    { postId: posts[0].id, userId: users[1].id, userName: users[1].name, texto: 'Parabens! Eu tambem comecei essa semana.' },
    { postId: posts[0].id, userId: users[2].id, userName: users[2].name, texto: 'Isso ai! Cada atitude conta.' },
    { postId: posts[4].id, userId: users[0].id, userName: users[0].name, texto: 'Que incrivel! Quero participar da proxima!' },
    { postId: posts[4].id, userId: users[3].id, userName: users[3].name, texto: '15kg! Voces sao demais!' },
    { postId: posts[4].id, userId: users[1].id, userName: users[1].name, texto: 'Inspirador! Vou organizar uma na minha cidade.' },
    { postId: posts[2].id, userId: users[0].id, userName: users[0].name, texto: 'Quero comecar a ir de bike tambem!' },
    { postId: posts[5].id, userId: users[3].id, userName: users[3].name, texto: 'Manda a receita completa!' },
    { postId: posts[7].id, userId: users[2].id, userName: users[2].name, texto: 'Adorei! Consertar e muito melhor que descartar.' },
    { postId: posts[9].id, userId: users[0].id, userName: users[0].name, texto: 'Boa! O primeiro dia e o mais dificil, depois vira habito.' },
  ];

  for (const c of comentariosData) {
    await prisma.comentario.create({ data: c });
  }

  // Atualizar contagem de comentarios nos posts
  await prisma.posts.update({ where: { id: posts[0].id }, data: { comentarios: 2 } });
  await prisma.posts.update({ where: { id: posts[4].id }, data: { comentarios: 3 } });
  await prisma.posts.update({ where: { id: posts[2].id }, data: { comentarios: 1 } });
  await prisma.posts.update({ where: { id: posts[5].id }, data: { comentarios: 1 } });
  await prisma.posts.update({ where: { id: posts[7].id }, data: { comentarios: 1 } });
  await prisma.posts.update({ where: { id: posts[9].id }, data: { comentarios: 1 } });

  console.log(`${comentariosData.length} comentarios criados`);

  // ========== LIKES ==========
  const likesData = [
    { userId: users[1].id, postId: posts[0].id },
    { userId: users[2].id, postId: posts[0].id },
    { userId: users[3].id, postId: posts[0].id },
    { userId: users[0].id, postId: posts[2].id },
    { userId: users[2].id, postId: posts[2].id },
    { userId: users[0].id, postId: posts[4].id },
    { userId: users[1].id, postId: posts[4].id },
    { userId: users[3].id, postId: posts[4].id },
    { userId: users[4].id, postId: posts[4].id },
    { userId: users[0].id, postId: posts[5].id },
    { userId: users[3].id, postId: posts[5].id },
    { userId: users[1].id, postId: posts[6].id },
    { userId: users[0].id, postId: posts[7].id },
    { userId: users[2].id, postId: posts[7].id },
    { userId: users[0].id, postId: posts[9].id },
    { userId: users[2].id, postId: posts[9].id },
  ];

  for (const l of likesData) {
    await prisma.userLike.create({ data: l });
  }

  // Atualizar contagem de curtidas
  await prisma.posts.update({ where: { id: posts[0].id }, data: { curtidas: 3 } });
  await prisma.posts.update({ where: { id: posts[2].id }, data: { curtidas: 2 } });
  await prisma.posts.update({ where: { id: posts[4].id }, data: { curtidas: 4 } });
  await prisma.posts.update({ where: { id: posts[5].id }, data: { curtidas: 2 } });
  await prisma.posts.update({ where: { id: posts[6].id }, data: { curtidas: 1 } });
  await prisma.posts.update({ where: { id: posts[7].id }, data: { curtidas: 2 } });
  await prisma.posts.update({ where: { id: posts[9].id }, data: { curtidas: 2 } });

  console.log(`${likesData.length} likes criados`);

  // ========== FOLLOWS ==========
  const followsData = [
    { followerId: users[0].id, followingId: users[1].id },
    { followerId: users[0].id, followingId: users[2].id },
    { followerId: users[1].id, followingId: users[0].id },
    { followerId: users[1].id, followingId: users[2].id },
    { followerId: users[2].id, followingId: users[0].id },
    { followerId: users[2].id, followingId: users[3].id },
    { followerId: users[3].id, followingId: users[2].id },
    { followerId: users[3].id, followingId: users[0].id },
    { followerId: users[4].id, followingId: users[2].id },
    { followerId: users[4].id, followingId: users[0].id },
  ];

  for (const f of followsData) {
    await prisma.follow.create({ data: f });
  }

  // Atualizar contadores de seguidores/seguindo
  await prisma.user.update({ where: { id: users[0].id }, data: { seguidores: 4, seguindo: 2 } });
  await prisma.user.update({ where: { id: users[1].id }, data: { seguidores: 1, seguindo: 2 } });
  await prisma.user.update({ where: { id: users[2].id }, data: { seguidores: 4, seguindo: 2 } });
  await prisma.user.update({ where: { id: users[3].id }, data: { seguidores: 1, seguindo: 2 } });
  await prisma.user.update({ where: { id: users[4].id }, data: { seguidores: 0, seguindo: 2 } });

  console.log(`${followsData.length} follows criados`);

  // ========== DESAFIOS CONCLUIDOS ==========
  const desafiosConcluidos = [
    { desafioId: desafios[0].id, userId: users[0].id },
    { desafioId: desafios[3].id, userId: users[0].id },
    { desafioId: desafios[4].id, userId: users[1].id },
    { desafioId: desafios[11].id, userId: users[2].id },
    { desafioId: desafios[8].id, userId: users[2].id },
    { desafioId: desafios[7].id, userId: users[2].id },
    { desafioId: desafios[2].id, userId: users[2].id },
    { desafioId: desafios[15].id, userId: users[3].id },
    { desafioId: desafios[18].id, userId: users[3].id },
    { desafioId: desafios[2].id, userId: users[4].id },
  ];

  for (const dc of desafiosConcluidos) {
    await prisma.desafiosConcluidos.create({ data: dc });
  }
  console.log(`${desafiosConcluidos.length} desafios concluidos criados`);

  // ========== CONQUISTAS DESBLOQUEADAS ==========
  const conquistasDesbloqueadas = [
    { conquistaId: conquistas[2].id, userId: users[0].id },
    { conquistaId: conquistas[5].id, userId: users[0].id },
    { conquistaId: conquistas[7].id, userId: users[0].id },
    { conquistaId: conquistas[2].id, userId: users[1].id },
    { conquistaId: conquistas[5].id, userId: users[1].id },
    { conquistaId: conquistas[2].id, userId: users[2].id },
    { conquistaId: conquistas[3].id, userId: users[2].id },
    { conquistaId: conquistas[5].id, userId: users[2].id },
    { conquistaId: conquistas[6].id, userId: users[2].id },
    { conquistaId: conquistas[7].id, userId: users[2].id },
    { conquistaId: conquistas[8].id, userId: users[2].id },
    { conquistaId: conquistas[2].id, userId: users[3].id },
    { conquistaId: conquistas[5].id, userId: users[3].id },
  ];

  for (const cu of conquistasDesbloqueadas) {
    await prisma.conquistaUsuario.create({ data: cu });
  }
  console.log(`${conquistasDesbloqueadas.length} conquistas desbloqueadas`);

  // ========== NOTIFICACOES ==========
  const notificacoes = [
    { userId: users[0].id, tipo: 'like', mensagem: 'Lucas Silva curtiu seu post', lida: true },
    { userId: users[0].id, tipo: 'comentario', mensagem: 'Maria Santos comentou no seu post', lida: false },
    { userId: users[0].id, tipo: 'conquista', mensagem: 'Voce desbloqueou a conquista Eco Iniciante!', lida: true },
    { userId: users[0].id, tipo: 'follow', mensagem: 'Pedro Oliveira comecou a te seguir', lida: false },
    { userId: users[1].id, tipo: 'like', mensagem: 'Bia Braunal curtiu seu post', lida: false },
    { userId: users[2].id, tipo: 'conquista', mensagem: 'Voce desbloqueou a conquista Eco Comprometido!', lida: true },
    { userId: users[2].id, tipo: 'follow', mensagem: 'Ana Costa comecou a te seguir', lida: false },
    { userId: users[3].id, tipo: 'comentario', mensagem: 'Maria Santos comentou no seu post', lida: false },
  ];

  for (const n of notificacoes) {
    await prisma.notificacao.create({ data: n });
  }
  console.log(`${notificacoes.length} notificacoes criadas`);

  console.log('\nSeed completo!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
