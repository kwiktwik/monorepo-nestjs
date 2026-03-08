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
    throw new Error(
      '[QueueModule] REDIS_URL is required for BullMQ queues. BullMQ uses Lua scripts that depend on native Redis features (cmsgpack) which are not available in ioredis-mock. Please set REDIS_URL in your environment variables.',
    );
  }

  const useRealRedis =
    !isMockMode() || config.get<boolean>('USE_REAL_REDIS_FOR_QUEUES', true);

  if (!useRealRedis) {
    throw new Error(
      '[QueueModule] Cannot use ioredis-mock with BullMQ. BullMQ requires real Redis due to Lua script dependencies (cmsgpack). Set USE_REAL_REDIS_FOR_QUEUES=true or provide REDIS_URL.',
    );
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
