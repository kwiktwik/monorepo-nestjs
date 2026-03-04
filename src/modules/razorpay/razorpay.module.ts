import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RazorpayController } from './razorpay.controller';
import { RazorpayService } from './razorpay.service';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { MockRazorpayService } from './razorpay.mock.service';
import * as bodyParser from 'body-parser';
import { AnalyticsModule } from '../analytics/analytics.module';
import { Request, Response, NextFunction } from 'express';
import { isMockMode } from '../../common/utils/is-mock-mode';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

// Custom middleware to preserve raw body for webhook signature verification
function rawBodyMiddleware(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction,
) {
  bodyParser.raw({ type: 'application/json' })(
    req,
    res,
    (err: Error | null) => {
      if (err) return next(err);
      req.rawBody = req.body;
      // Convert buffer to string for JSON parsing later
      req.body = req.body.toString('utf8');
      next();
    },
  );
}

@Module({
  imports: [AnalyticsModule],
  controllers: [RazorpayController, RazorpayWebhookController],
  providers: [
    {
      provide: RazorpayService,
      useClass: isMockMode() ? MockRazorpayService : RazorpayService,
    },
    RazorpayWebhookService,
  ],
  exports: [RazorpayService],
})
export class RazorpayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply raw body parser for webhook routes to preserve body for signature verification
    consumer.apply(rawBodyMiddleware).forRoutes(RazorpayWebhookController);
  }
}
