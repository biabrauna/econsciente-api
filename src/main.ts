// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import session from 'express-session';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.use(
//     session({
//       secret: 'sdaslfhksfjkadslçdfjlaskjfadsklçfkadsçfkal',
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         maxAge: 1000 * 60 * 60 * 24, // 1 day
//         secure: true, // set to true if using HTTPS
//       },
//     })
//   );
//   app.enableCors({
//     origin: ['https://econsciente-app.netlify.app', 'http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
//     methods: 'GET, POST, PUT, DELETE',
//     credentials: true,
//     allowedHeaders: 'Content-Type, Authorization',
//   });
//   // Swagger config
//   const config = new DocumentBuilder()
//     .setTitle('Minha API')
//     .setDescription('Documentação Swagger gerada automaticamente')
//     .setVersion('1.0')
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api-docs', app, document);

//   // Railway usa porta dinâmica
//   const port = process.env.PORT || 3000;
//   await app.listen(port);

//   console.log(`App rodando na porta ${port}`);
//   console.log(`Swagger disponível em http://localhost:${port}/api-docs`);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // NOVO IMPORT
import session from 'express-session';
import { CustomLoggerService } from './common/logger/custom-logger.service';

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
    }),
  );

  // NOVO: Pipe de validação global para o módulo Vision
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'https://econsciente-app.netlify.app',
      'http://localhost:5175',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: 'GET, POST, PUT, DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Swagger config - ATUALIZADO
  const config = new DocumentBuilder()
    .setTitle('EcoConsciente API')
    .setDescription(
      'API do EcoConsciente com módulo de visão computacional para verificação de desafios',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação')
    .addTag('users', 'Usuários')
    .addTag('posts', 'Posts dos usuários')
    .addTag('desafios', 'Desafios ambientais')
    .addTag('profile-pic', 'Fotos de perfil')
    .addTag('vision', 'Endpoints de visão computacional')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Railway usa porta dinâmica
  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = app.get(CustomLoggerService);
  
  logger.log('Application started successfully', {
    port,
    environment: process.env.NODE_ENV || 'development',
    type: 'startup',
  });
  
  logger.log('Swagger documentation available', {
    url: `http://localhost:${port}/api-docs`,
    type: 'startup',
  });
  
  logger.log('Vision module active', {
    endpoint: '/vision/verify-challenge',
    type: 'startup',
  });
}
bootstrap();
