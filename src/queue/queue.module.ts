import { Module, Global, DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { isMockMode } from '../common/utils/is-mock-mode';

/**
 * Factory for creating Redis connection based on environment.
 * In mock mode, uses ioredis-mock for in-memory Redis.
 */
function createRedisConnection(config: ConfigService): Redis {
  if (isMockMode()) {
    // Dynamic import for ioredis-mock (in-memory Redis)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RedisMock = require('ioredis-mock').default;
    console.log('[QueueModule] Using ioredis-mock for in-memory Redis');
    return new RedisMock();
  }
  
  // Production Redis configuration
  const redisUrl = config.get<string>('REDIS_URL');
  const redisHost = config.get<string>('REDIS_HOST', 'localhost');
  const redisPort = config.get<number>('REDIS_PORT', 6379);
  
  if (redisUrl) {
    console.log(`[QueueModule] Connecting to Redis via URL`);
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
    });
  }
  
  console.log(`[QueueModule] Connecting to Redis at ${redisHost}:${redisPort}`);
  return new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: 3,
  });
}

@Global()
@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            connection: createRedisConnection(config),
          }),
          inject: [ConfigService],
        }),
      ],
      exports: [BullModule],
      global: true,
    };
  }
}