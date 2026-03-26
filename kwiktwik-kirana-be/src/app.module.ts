import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { DrizzleModule } from './database/drizzle.module';
import { DrizzleTestModule } from './database/drizzle-test.module';
import { AuthModule } from './modules/auth/auth.module';
import { MigrationModule } from './modules/migration/migration.module';
import { ConfigModule } from './modules/config/config.module';
import { UserModule } from './modules/user/user.module';
import { UploadModule } from './modules/upload/upload.module';
import { RazorpayModule } from './modules/razorpay/razorpay.module';
import { PhonePeV2Module } from './modules/phonepe-v2/phonepe-v2.module';
import { FeedModule } from './modules/feed/feed.module';
import { BackgroundRemovalModule } from './modules/background-removal/background-removal.module';
import { VideoOverlayModule } from './modules/video-overlay/video-overlay.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NotificationEventsModule } from './modules/notification-events/notification-events.module';
import { DeviceSessionModule } from './modules/device-session/device-session.module';
import { HealthController } from './modules/health/health.controller';
import { DbDebugModule } from './debug/db-debug.module';
import { MqttModule } from './common/mqtt/mqtt.module';
import { RedisModule } from './common/redis/redis.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AdminModule } from './modules/admin/admin.module';

const dbModule =
  process.env.USE_MOCK_DB === 'true' ? DrizzleTestModule : DrizzleModule;

@Module({
  imports: [
    SentryModule.forRoot(),
    NestConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    dbModule,
    DbDebugModule,
    AuthModule,
    MigrationModule,
    ConfigModule,
    UserModule,
    UploadModule,
    RazorpayModule,
    PhonePeV2Module,
    FeedModule,
    BackgroundRemovalModule,
    VideoOverlayModule,
    NotificationModule,
    // Dynamic modules that check Redis availability
    NotificationEventsModule.forRoot({
      get: (key: string) => process.env[key],
    } as ConfigService),
    DeviceSessionModule,
    MqttModule,
    RedisModule,
    ConversationsModule,
    MessagesModule.forRoot({
      get: (key: string) => process.env[key],
    } as ConfigService),
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
