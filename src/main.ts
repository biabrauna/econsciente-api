import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './common/logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pipe de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration from environment
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: corsOrigins,
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
