import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Minha API')
    .setDescription('Documentação Swagger gerada automaticamente')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Railway usa porta dinâmica
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`App rodando na porta ${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api-docs`);
}
bootstrap();
