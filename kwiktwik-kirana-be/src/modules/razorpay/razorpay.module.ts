import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { RazorpayController } from './razorpay.controller';
import { RazorpayPlansController } from './razorpay-plans.controller';
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

const logger = new Logger('RazorpayRawBodyMiddleware');

/**
 * Custom middleware to preserve raw body buffer for webhook signature verification.
 * This is CRITICAL for Razorpay webhook signature verification to work correctly.
 * 
 * The raw body must be preserved exactly as received (byte-for-byte) because
 * the signature is computed on the exact raw bytes of the request body.
 * Any transformation (JSON parsing, whitespace changes, key reordering) will
 * break signature verification.
 */
function rawBodyMiddleware(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction,
) {
  bodyParser.raw({ 
    type: '*/*',  // Accept any content type to be safe
    limit: '1mb', // Razorpay webhooks shouldn't exceed this
  })(
    req,
    res,
    (err: Error | null) => {
      if (err) {
        logger.error('Failed to parse raw body:', err.message);
        return next(err);
      }
      
      // Save the raw Buffer before any transformation
      // This is the EXACT bytes that Razorpay signed
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
        logger.debug(`Raw body captured: ${req.body.length} bytes`);
      } else {
        logger.warn('req.body is not a Buffer after bodyParser.raw()');
      }
      
      next();
    },
  );
}

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
export class RazorpayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply raw body parser for webhook routes to preserve body for signature verification
    consumer.apply(rawBodyMiddleware).forRoutes(RazorpayWebhookController);
  }
}
