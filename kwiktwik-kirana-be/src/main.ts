import './instrument'; // Must be first - initializes Sentry before NestJS

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { validateAppConfigSyncOrThrow } from './common/config/config-validator';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate app config synchronization before starting server
  // This ensures all registered apps have corresponding config entries
  validateAppConfigSyncOrThrow();
  const app = await NestFactory.create(AppModule, {
    // Disable default body parsing - we'll configure manually
    bodyParser: false,
  });

  // Enable graceful shutdown - flushes Sentry events on SIGTERM/SIGINT
  app.enableShutdownHooks();

  // Apply raw body parser FIRST for webhook routes (must be before JSON parser)
  // This ensures Razorpay webhooks get raw body for signature verification
  app.use(
    '/api/razorpay/webhook',
    bodyParser.raw({
      type: '*/*',
      limit: '1mb',
    }),
  );

  // Apply JSON parser for all other routes
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // All API routes under /api (health and metrics excluded for load balancers)
  app.setGlobalPrefix('api', { exclude: ['health', 'metrics'] });

  // Enable URI versioning for v2 endpoints
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // Swagger API documentation
  const port = process.env.PORT || 3002;

  const config = new DocumentBuilder()
    .setTitle('KwikTwik Kirana API')
    .setDescription(
      'API documentation for ShareStatus/Kirana backend - Authentication, Config, User management',
    )
    .setVersion('1.0')
    .addServer('/', 'Current server')
    .addServer('https://api.kiranaapps.com', 'Production API')
    .addServer('https://services.kiranaapps.com', 'Production Services')
    .addServer(`http://localhost:${port}`, 'Local development')
    .addTag('auth', 'Authentication - OTP & Google Sign-in')
    .addTag(
      'auth-v1',
      'Authentication v1 - Unified Login (OTP, Truecaller, Google)',
    )
    .addTag('config', 'App Configuration')
    .addTag('user', 'User Management')
    .addTag('feed', 'Home Feed & Categories')
    .addTag('health', 'Health Check')
    .addTag('events', 'Notification Events')
    .addTag('razorpay', 'Razorpay Payments & Subscriptions')
    .addTag('PhonePe Autopay', 'PhonePe Autopay Subscription and Payment APIs')
    .addTag('admin', 'Admin Scripts & Management')
    .addTag('admin-phonepe', 'Admin PhonePe Management')
    .addTag('admin/notifications', 'Admin Notifications')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-App-ID',
        in: 'header',
        description: 'App identifier (default: com.paymentalert.app)',
      },
      'X-App-ID',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'admin-basic')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger at /api/admin/docs - protected by AdminAuthMiddleware
  SwaggerModule.setup('admin/docs', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
      // Set default X-App-ID header value
      requestInterceptor: (request) => {
        if (!request.headers['X-App-ID']) {
          request.headers['X-App-ID'] = 'com.paymentalert.app';
        }
        return request;
      },
    },
  });

  // Mock Data Swagger Instance - also under admin for protection
  if (
    process.env.USE_MOCK_DB === 'true' ||
    process.env.NODE_ENV !== 'production'
  ) {
    const mockConfig = new DocumentBuilder()
      .setTitle('KwikTwik Kirana Mock API')
      .setDescription(
        'API documentation for testing with mock data and rules engine',
      )
      .setVersion('1.0-mock')
      .addServer('/', 'Mock environment')
      .addApiKey({ type: 'apiKey', name: 'X-App-ID', in: 'header' }, 'X-App-ID')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .build();
    const mockDocument = SwaggerModule.createDocument(app, mockConfig);
    SwaggerModule.setup('admin/mock-docs', app, mockDocument, {
      useGlobalPrefix: true,
    });
    logger.log(
      `📖 Mock Swagger docs: http://localhost:${port}/api/admin/mock-docs`,
    );
  }

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
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

  // Notify PM2 that the app is ready (required when wait_ready: true in ecosystem config)
  if (process.send) {
    process.send('ready');
  }

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(
    `🔐 JWT: ${process.env.JWT_SECRET ? 'JWT_SECRET set from env' : 'WARNING: Using default JWT secret'}`,
  );
  logger.log(`📋 Health check: http://localhost:${port}/health`);
  logger.log(`📊 Prometheus metrics: http://localhost:${port}/metrics`);
  logger.log(
    `📖 Swagger docs (admin protected): http://localhost:${port}/api/admin/docs`,
  );
  logger.log(`📱 Default X-App-ID: com.paymentalert.app`);

  if (
    process.env.ENABLE_DB_DEBUG === 'true' ||
    process.env.USE_MOCK_DB === 'true' ||
    process.env.NODE_ENV === 'test'
  ) {
    logger.log(`🐛 DB Debug UI: http://localhost:${port}/api/debug/db`);
  }
}

void bootstrap();
