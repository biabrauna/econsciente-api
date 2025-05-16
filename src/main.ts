import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'sdaslfhksfjkadslçdfjlaskjfadsklçfkadsçfkal',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: true, // set to true if using HTTPS
      },
    })
  );
  app.enableCors({
    origin: ['https://econsciente-app.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
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
