import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // All API routes under /api (health excluded for load balancers)
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Swagger API documentation
  const port = process.env.PORT || 4010;
  const baseUrl = `http://localhost:${port}`;

  const config = new DocumentBuilder()
    .setTitle('KwikTwik Kirana API')
    .setDescription(
      'API documentation for ShareStatus/Kirana backend - Authentication, Config, User management',
    )
    .setVersion('1.0')
    .addServer(baseUrl, 'Local development')
    .addTag('auth', 'Authentication - OTP & Google Sign-in')
    .addTag('config', 'App Configuration')
    .addTag('user', 'User Management')
    .addTag('feed', 'Home Feed & Categories')
    .addTag('health', 'Health Check')
    .addApiKey({ type: 'apiKey', name: 'X-App-ID', in: 'header' }, 'X-App-ID')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:4010',
      'http://localhost:5173',
      'http://localhost:4200',
      'http://127.0.0.1:4010',
      'http://127.0.0.1:5173',
      'https://app.storyowl.app',
      'https://build.kiranaapps.com',
      'https://preprod.kiranaapps.com',
      'https://alertpay.kiranaapps.com',
      'https://api.sharekaro.shop',
      'https://app.sharekaro.shop',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-App-ID',
      'x-app-id',
      'X-App-Identifier',
      'x-app-identifier',
    ],
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(
    `🔐 JWT: ${process.env.JWT_SECRET ? 'JWT_SECRET set from env' : 'WARNING: Using default JWT secret'}`,
  );
  logger.log(`📋 Health check: http://localhost:${port}/health`);
  logger.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}

void bootstrap();
