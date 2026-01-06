import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('❌ MONGODB_URL não configurada');
  process.exit(1);
}

async function checkCounts() {
  console.log('📊 Verificando totais no MongoDB...\n');

  const mongoClient = new MongoClient(MONGODB_URL as string);
  await mongoClient.connect();
  const mongodb = mongoClient.db();

  const collections = [
    'User',
    'Posts',
    'Comentario',
    'UserLike',
    'Desafios',
    'DesafiosConcluidos',
    'Conquista',
    'ConquistaUsuario',
    'Follow',
    'Notificacao',
    'Session',
    'ProfilePic'
  ];

  console.log('Collection                  | Total');
  console.log('--------------------------- | -----');

  for (const collection of collections) {
    try {
      const count = await mongodb.collection(collection).countDocuments();
      console.log(`${collection.padEnd(27)} | ${count}`);
    } catch (error) {
      console.log(`${collection.padEnd(27)} | 0 (não existe)`);
    }
  }

  await mongoClient.close();
  console.log('\n✅ Verificação concluída!');
}

checkCounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
