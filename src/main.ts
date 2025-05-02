import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Se estiver rodando em ambiente local (não serverless)
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Aplicação rodando na porta ${port}`);
  }
  
  return app;
}

// Isso serve para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Esta é a função que a Vercel irá chamar
export default async (req, res) => {
  const app = await bootstrap();
  const expressInstance = app.getHttpAdapter().getInstance();
  
  // Processar a requisição usando o Express
  return expressInstance(req, res);
};