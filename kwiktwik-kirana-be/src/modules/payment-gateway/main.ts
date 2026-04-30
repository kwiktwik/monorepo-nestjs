/**
 * Payment Gateway Standalone Service Bootstrap
 *
 * Entry point for running the payment-gateway module as an independent service.
 * This allows the payment system to be deployed separately from the main application.
 *
 * Usage:
 *   npx ts-node -P tsconfig.json src/modules/payment-gateway/main.ts
 *
 * Environment Variables:
 *   PORT - Server port (default: 3001)
 *   NODE_ENV - Environment (development, production)
 *   PAYMENT_ENCRYPTION_KEY - 32-byte hex key for encryption
 *   DATABASE_URL - PostgreSQL connection string
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { PaymentGatewayModule } from './payment-gateway.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create NestJS application
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(PaymentGatewayModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-App-ID'],
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Payment Gateway API')
    .setDescription(
      'Unified payment gateway supporting Razorpay and PhonePe providers. ' +
        'Supports both provider-managed and user-managed subscriptions.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-App-ID', in: 'header' }, 'app-id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Health check endpoint (outside API prefix)
  app.getHttpAdapter().get('/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    });
  });

  // Get port from environment
  const port = parseInt(process.env.PORT ?? '3001', 10);

  // Start server
  await app.listen(port);

  logger.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Payment Gateway Service Started                 ║
╠════════════════════════════════════════════════════════════════╣
║  API:      http://localhost:${port}/api                           ║
║  Health:   http://localhost:${port}/health                        ║
║  Docs:     http://localhost:${port}/docs                          ║
╠════════════════════════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV ?? 'development'}
║  Node.js:     ${process.version}
╚════════════════════════════════════════════════════════════════╝
  `);
}

// Run bootstrap
bootstrap().catch((error) => {
  console.error('Failed to start Payment Gateway service:', error);
  process.exit(1);
});
