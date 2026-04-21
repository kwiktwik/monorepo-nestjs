import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { GlobalRateLimitMiddleware } from './global-rate-limit.middleware';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [GlobalRateLimitMiddleware],
  exports: [GlobalRateLimitMiddleware],
})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply global rate limiting to all routes
    consumer.apply(GlobalRateLimitMiddleware).forRoutes('*');
  }
}
