import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

// Usando um adaptador Express
async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );
  app.enableCors();
  await app.init();
}

// Inicializa a aplicação
bootstrap();

// Exporta a instância do Express para ser usada pelo serverless
export default server;