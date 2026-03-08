import { Module } from '@nestjs/common';
import { RazorpayController } from './razorpay.controller';
import { RazorpayPlansController } from './razorpay-plans.controller';
import { RazorpayService } from './razorpay.service';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { MockRazorpayService } from './razorpay.mock.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { isMockMode } from '../../common/utils/is-mock-mode';

@Module({
  imports: [AnalyticsModule],
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
  ],
  exports: [RazorpayService],
})
export class RazorpayModule {}
