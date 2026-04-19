import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const desafios = [
  {
    desafios: 'Separe corretamente plástico, vidro, metal e papel durante 7 dias consecutivos e fotografe as lixeiras separadas',
    valor: 50,
  },
  {
    desafios: 'Leve pelo menos 5kg de materiais recicláveis a um ponto de coleta seletiva e fotografe o momento da entrega',
    valor: 100,
  },
  {
    desafios: 'Colete e descarte corretamente 10 pilhas ou baterias usadas em um ponto de coleta especializado',
    valor: 80,
  },
  {
    desafios: 'Junte 20 tampinhas plásticas de garrafas PET e entregue a uma cooperativa de reciclagem',
    valor: 30,
  },
  {
    desafios: 'Destine corretamente 5 embalagens Tetra Pak (caixinhas de leite ou suco) a um ponto de coleta',
    valor: 40,
  },
  {
    desafios: 'Leve um resíduo eletrônico (celular, carregador, cabo, ou qualquer e-lixo) a um ponto especializado de descarte',
    valor: 150,
  },
  {
    desafios: 'Colete 5 lâmpadas fluorescentes ou LED queimadas e entregue em ponto de coleta correto — nunca no lixo comum',
    valor: 120,
  },
  {
    desafios: 'Encha uma caixa grande de papelão com papelão descartado e leve a uma cooperativa de catadores',
    valor: 60,
  },
  {
    desafios: 'Guarde o óleo de cozinha usado de 5 preparações em garrafa PET e leve a um ponto de coleta de óleo',
    valor: 90,
  },
  {
    desafios: 'Participe de um mutirão de limpeza ou coleta seletiva no seu bairro e fotografe sua participação',
    valor: 200,
  },
  {
    desafios: 'Separe e recicle todas as embalagens de um dia inteiro de consumo — zero descarte no lixo comum',
    valor: 70,
  },
  {
    desafios: 'Leve medicamentos vencidos ou em excesso a uma farmácia com ponto de coleta Descarte Certo',
    valor: 110,
  },
];

async function main() {
  console.log('Populando desafios de coleta seletiva...\n');

  for (const desafio of desafios) {
    const existing = await prisma.desafios.findFirst({
      where: { desafios: desafio.desafios },
    });

    if (!existing) {
      await prisma.desafios.create({ data: desafio });
      console.log(`✅ Criado: "${desafio.desafios.slice(0, 60)}..." (${desafio.valor} pts)`);
    } else {
      console.log(`⏭️  Já existe: "${desafio.desafios.slice(0, 60)}..."`);
    }
  }

  console.log(`\n${desafios.length} desafios verificados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
