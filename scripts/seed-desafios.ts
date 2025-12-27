import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const desafios = [
  {
    desafios: 'Usar garrafa reutilizável por uma semana',
    valor: 20,
  },
  {
    desafios: 'Separar o lixo reciclável por 3 dias consecutivos',
    valor: 15,
  },
  {
    desafios: 'Não usar plástico descartável por um dia',
    valor: 10,
  },
  {
    desafios: 'Fazer compostagem de resíduos orgânicos',
    valor: 25,
  },
  {
    desafios: 'Usar transporte público ou bicicleta por uma semana',
    valor: 30,
  },
  {
    desafios: 'Desligar aparelhos da tomada quando não estiver usando',
    valor: 10,
  },
  {
    desafios: 'Tomar banhos de no máximo 5 minutos por 3 dias',
    valor: 15,
  },
  {
    desafios: 'Plantar uma árvore ou cultivar uma planta',
    valor: 25,
  },
  {
    desafios: 'Fazer uma refeição sem carne (segunda sem carne)',
    valor: 10,
  },
  {
    desafios: 'Reutilizar sacolas de pano para compras',
    valor: 10,
  },
  {
    desafios: 'Criar um produto a partir de material reciclado',
    valor: 30,
  },
  {
    desafios: 'Organizar uma limpeza em área pública (praia, parque)',
    valor: 40,
  },
  {
    desafios: 'Reduzir o consumo de papel usando anotações digitais',
    valor: 15,
  },
  {
    desafios: 'Compartilhar conhecimento sobre sustentabilidade com 3 pessoas',
    valor: 20,
  },
  {
    desafios: 'Usar produtos de limpeza ecológicos por uma semana',
    valor: 20,
  },
  {
    desafios: 'Consertar algo em vez de jogar fora',
    valor: 15,
  },
  {
    desafios: 'Comprar produtos locais e da estação',
    valor: 15,
  },
  {
    desafios: 'Evitar fast fashion - não comprar roupas novas por um mês',
    valor: 35,
  },
  {
    desafios: 'Fazer uma doação de itens que você não usa mais',
    valor: 20,
  },
  {
    desafios: 'Usar iluminação natural durante o dia',
    valor: 10,
  },
];

async function seed() {
  console.log('🌱 Populando banco de dados com desafios...');

  for (const desafio of desafios) {
    const exists = await prisma.desafios.findFirst({
      where: { desafios: desafio.desafios },
    });

    if (!exists) {
      await prisma.desafios.create({ data: desafio });
      console.log(`✅ Desafio criado: ${desafio.desafios}`);
    } else {
      console.log(`⏭️  Desafio já existe: ${desafio.desafios}`);
    }
  }

  console.log('\n🎉 Seed completo! Total de desafios:', desafios.length);
  await prisma.$disconnect();
}

seed()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  });
