import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Criamos uma instância do Express para ser reutilizada
const expressApp = express();

// Esta função bootstrap será usada tanto para desenvolvimento local quanto serverless
async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  
  app.enableCors();
  
  // Inicializa a aplicação
  await app.init();
  
  return app;
}

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(app => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Aplicação rodando na porta ${port}`);
    });
  });
}

// Exporta a instância do Express para ser usada pela Vercel
export default expressApp;