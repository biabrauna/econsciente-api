import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  
  // Configure CORS with the same settings as your Express app
  const allowedOrigins = [
    'https://econsciente-app.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    // Add more origins as needed
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // For development/testing - accept any origin
        // In production, you might want to remove this
        return callback(null, true);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Optional: Log middleware for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'unknown'}`);
    next();
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
  console.log(`CORS is configured for: ${allowedOrigins.join(', ')} and all origins in development`);
}
bootstrap();