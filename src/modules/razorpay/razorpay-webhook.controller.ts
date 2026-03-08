import {
  Controller,
  Post,
  Req,
  Headers,
  Query,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { RazorpayWebhookService } from './razorpay-webhook.service';

@ApiTags('razorpay-webhook')
@Controller('razorpay/webhook')
export class RazorpayWebhookController {
  private readonly logger = new Logger(RazorpayWebhookController.name);

  constructor(private readonly webhookService: RazorpayWebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Handle Razorpay webhook for specific app' })
  @ApiQuery({
    name: 'appId',
    description:
      'App identifier (e.g., com.paymentalert.app, com.sharekaro.kirana)',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or bad request' })
  async handleWebhook(
    @Query('appId') appId: string,
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
    @Headers('x-razorpay-event-id') eventId: string,
  ) {
    this.logger.log(
      `[WEBHOOK] Incoming Razorpay webhook | appId=${
        appId || 'N/A'
      } | eventId=${eventId || 'N/A'} | signature=${signature ? 'present' : 'missing'} | content-type=${
        (req.headers['content-type'] as string) || 'N/A'
      }`,
    );

    if (!appId) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook due to missing appId in query params | URL=${req.originalUrl || req.url}`,
      );
      throw new BadRequestException('App ID is required');
    }

    if (!signature) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook for appId=${appId} due to missing signature header`,
      );
      throw new UnauthorizedException('Missing webhook signature');
    }

    if (!eventId) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook for appId=${appId} due to missing event ID header`,
      );
      throw new BadRequestException('Missing event ID');
    }

    // Get raw body - with bodyParser.raw() applied at main.ts level for production,
    // req.body will be a Buffer. For testing, it may be a parsed object.
    let bodyString: string;
    
    if (Buffer.isBuffer(req.body)) {
      // Production: raw body from bodyParser.raw()
      const rawBody = req.body as Buffer;
      bodyString = rawBody.toString('utf-8');
      this.logger.log(
        `[WEBHOOK] Raw body captured for appId=${appId} | size=${rawBody.length} bytes`,
      );
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Testing: JSON was parsed, stringify it back
      bodyString = JSON.stringify(req.body);
      this.logger.log(
        `[WEBHOOK] Parsed body for appId=${appId} | re-serialized for signature verification`,
      );
    } else if (typeof req.body === 'string') {
      // Testing or edge case: body is already a string
      bodyString = req.body;
    } else {
      this.logger.error(
        `[WEBHOOK] CRITICAL: req.body is not valid for appId=${appId}. ` +
        `Type: ${typeof req.body}. ` +
        `Ensure raw body parser is configured in main.ts before JSON parser.`
      );
      throw new BadRequestException(
        'Webhook body not available. Contact support.'
      );
    }

    return this.webhookService.processWebhook(
      appId,
      bodyString,
      signature,
      eventId,
    );
  }
}
