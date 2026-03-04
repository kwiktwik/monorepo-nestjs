import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { DrizzleModule } from './database/drizzle.module';
import { DrizzleTestModule } from './database/drizzle-test.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from './modules/config/config.module';
import { UserModule } from './modules/user/user.module';
import { UploadModule } from './modules/upload/upload.module';
import { RazorpayModule } from './modules/razorpay/razorpay.module';
import { PhonePeModule } from './modules/phonepe/phonepe.module';
import { FeedModule } from './modules/feed/feed.module';
import { BackgroundRemovalModule } from './modules/background-removal/background-removal.module';
import { VideoOverlayModule } from './modules/video-overlay/video-overlay.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NotificationEventsModule } from './modules/notification-events/notification-events.module';
import { DeviceSessionModule } from './modules/device-session/device-session.module';
import { HealthController } from './modules/health/health.controller';
import { DbDebugModule } from './debug/db-debug.module';

const dbModule =
  process.env.USE_MOCK_DB === 'true' ? DrizzleTestModule : DrizzleModule;

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    dbModule,
    DbDebugModule,
    AuthModule,
    ConfigModule,
    UserModule,
    UploadModule,
    RazorpayModule,
    PhonePeModule,
    FeedModule,
    BackgroundRemovalModule,
    VideoOverlayModule,
    NotificationModule,
    NotificationEventsModule,
    DeviceSessionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
