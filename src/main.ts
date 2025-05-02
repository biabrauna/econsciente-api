import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );
  
  // Configuração para CORS, se necessário
  app.enableCors();
  
  // Configuração de prefixo global, se necessário
  // app.setGlobalPrefix('api');
  
  await app.init();
  
  return app;
}

// Para ambiente de desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(app => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Aplicação rodando na porta ${port}`);
    });
  });
}

// Isso é necessário para o ambiente serverless da Vercel
export default async (req, res) => {
  const app = await bootstrap();
  server(req, res);
};