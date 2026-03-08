import {
  Module,
  Global,
  DynamicModule,
  Provider,
  InjectionToken,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { isMockMode } from '../common/utils/is-mock-mode';

export const QUEUES_ENABLED = Symbol(
  'QUEUES_ENABLED',
) as InjectionToken<boolean>;

/**
 * Check if Redis is available and suitable for BullMQ queues.
 * BullMQ requires real Redis due to Lua script dependencies (cmsgpack).
 */
export function isRedisAvailable(config: ConfigService): boolean {
  const redisUrl = config.get<string>('REDIS_URL');
  if (!redisUrl) {
    return false;
  }

  // If in mock mode and not forcing real Redis, don't use queues
  if (
    isMockMode() &&
    !config.get<boolean>('USE_REAL_REDIS_FOR_QUEUES', false)
  ) {
    return false;
  }

  return true;
}

/**
 * Factory for creating Redis connection for queues.
 */
function createRedisConnection(config: ConfigService): Redis {
  const redisUrl = config.get<string>('REDIS_URL');

  console.log(`[QueueModule] Connecting to Redis at ${redisUrl}`);
  return new Redis(redisUrl!, {
    maxRetriesPerRequest: null,
  });
}

@Global()
@Module({})
export class QueueModule {
  /**
   * Initialize BullMQ with real Redis connection.
   * Throws if Redis is unavailable.
   */
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
      providers: [
        {
          provide: QUEUES_ENABLED,
          useValue: true,
        },
      ],
      exports: [BullModule, QUEUES_ENABLED],
      global: true,
    };
  }

  /**
   * Initialize only if Redis is available.
   * Returns empty module with QUEUES_ENABLED=false if Redis unavailable.
   */
  static forRootIfAvailable(): DynamicModule {
    // Use a factory to check at runtime
    const redisAvailable =
      process.env.REDIS_URL &&
      (!isMockMode() || process.env.USE_REAL_REDIS_FOR_QUEUES === 'true');

    if (!redisAvailable) {
      console.log(
        '[QueueModule] Redis unavailable or in mock mode. Queue features disabled.',
      );
      return {
        module: QueueModule,
        imports: [],
        providers: [
          {
            provide: QUEUES_ENABLED,
            useValue: false,
          },
        ],
        exports: [QUEUES_ENABLED],
        global: true,
      };
    }

    return this.forRoot();
  }
}
