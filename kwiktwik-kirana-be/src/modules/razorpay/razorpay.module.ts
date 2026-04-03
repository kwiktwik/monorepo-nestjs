import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RazorpayController } from './razorpay.controller';
import { RazorpayPlansController } from './razorpay-plans.controller';
import { RazorpayService } from './razorpay.service';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { MockRazorpayService } from './razorpay.mock.service';
import { FourHourEventSchedulerService } from './scheduler/four-hour-event.scheduler';
import { AnalyticsModule } from '../analytics/analytics.module';
import { isMockMode } from '../../common/utils/is-mock-mode';

@Module({
  imports: [AnalyticsModule, ScheduleModule.forRoot()],
  controllers: [
    RazorpayController,
    RazorpayPlansController,
    RazorpayWebhookController,
  ],
  providers: [
    {
      provide: RazorpayService,
      useClass: isMockMode() ? MockRazorpayService : RazorpayService,
    },
    RazorpayWebhookService,
    FourHourEventSchedulerService,
  ],
  exports: [RazorpayService, FourHourEventSchedulerService],
})
export class RazorpayModule {}
