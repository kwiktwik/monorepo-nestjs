import { Module, Global, DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { isMockMode } from '../common/utils/is-mock-mode';

/**
 * Factory for creating Redis connection for queues.
 * BullMQ requires real Redis due to Lua script dependencies.
 * Set USE_REAL_REDIS_FOR_QUEUES=true to force real Redis even in mock mode.
 */
function createRedisConnection(config: ConfigService): Redis {
  const redisUrl = config.get<string>('REDIS_URL');

  if (!redisUrl) {
    console.log(
      '[QueueModule] REDIS_URL not configured. Using ioredis-mock for queues.',
    );
    const RedisMock = require('ioredis-mock').default;
    return new RedisMock() as unknown as Redis;
  }

  const useRealRedis =
    !isMockMode() || config.get<boolean>('USE_REAL_REDIS_FOR_QUEUES', true);

  if (!useRealRedis) {
    const RedisMock = require('ioredis-mock').default;
    console.log(
      '[QueueModule] Using ioredis-mock for queues (queues may fail with BullMQ)',
    );
    return new RedisMock() as unknown as Redis;
  }

  console.log(`[QueueModule] Connecting to Redis via URL`);
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
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
          useFactory: (config: ConfigService) =>
            ({
              connection: createRedisConnection(config),
            }) as any,
          inject: [ConfigService],
        }),
      ],
      exports: [BullModule],
      global: true,
    };
  }
}
