import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DrizzleModule } from '../../database/drizzle.module';

// Infrastructure
import { PhonePeAuthManager } from './infrastructure/http/auth-manager';
import { PhonePeHttpClient } from './infrastructure/http/phonepe-http.client';
import { SubscriptionDrizzleRepository } from './infrastructure/repositories/subscription.repository';
import { RedemptionDrizzleRepository } from './infrastructure/repositories/redemption.repository';
import { PhonePeWebhookController } from './infrastructure/webhooks/webhook.controller';

// Application
import { SubscriptionService } from './application/services/subscription.service';
import { RedemptionSchedulerService } from './application/services/redemption-scheduler.service';

// Presentation
import { SubscriptionController } from './presentation/subscription.controller';

// Constants
import { SUBSCRIPTION_REPOSITORY, REDEMPTION_REPOSITORY } from './constants';

@Module({
  imports: [ConfigModule, DrizzleModule, ScheduleModule.forRoot()],
  controllers: [SubscriptionController, PhonePeWebhookController],
  providers: [
    // HTTP Client
    PhonePeAuthManager,
    PhonePeHttpClient,

    // Repositories
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionDrizzleRepository,
    },
    {
      provide: REDEMPTION_REPOSITORY,
      useClass: RedemptionDrizzleRepository,
    },

    // Services
    SubscriptionService,
    RedemptionSchedulerService,
  ],
  exports: [SubscriptionService, RedemptionSchedulerService],
})
export class PhonePeV2Module {}
