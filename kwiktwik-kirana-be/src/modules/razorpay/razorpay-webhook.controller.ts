import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { RazorpayWebhookService } from './razorpay-webhook.service';

@ApiTags('razorpay-webhook')
@Controller('razorpay/webhook')
export class RazorpayWebhookController {
  private readonly logger = new Logger(RazorpayWebhookController.name);

  constructor(private readonly webhookService: RazorpayWebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Handle Razorpay webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or bad request' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
    @Headers('x-razorpay-event-id') eventId: string,
  ) {
    // Extract raw body first for logging purposes
    let rawBodyString: string;
    if (Buffer.isBuffer(req.body)) {
      rawBodyString = (req.body as Buffer).toString('utf-8');
    } else if (typeof req.body === 'object' && req.body !== null) {
      rawBodyString = JSON.stringify(req.body);
    } else if (typeof req.body === 'string') {
      rawBodyString = req.body;
    } else {
      rawBodyString = 'Unable to extract body';
    }

    // Parse the webhook payload to extract account_id and event type
    let accountId: string | null = null;
    let eventType = 'unknown';
    try {
      const parsed = JSON.parse(rawBodyString);
      eventType = parsed.event || 'unknown';
      accountId = parsed.account_id || null;
    } catch {
      // Keep as unknown if parsing fails
    }

    this.logger.log(
      `[WEBHOOK] Incoming Razorpay webhook | accountId=${accountId || 'N/A'} | eventId=${eventId || 'N/A'} | eventType=${eventType} | signature=${signature ? 'present' : 'missing'} | content-type=${
        (req.headers['content-type'] as string) || 'N/A'
      }`,
    );

    if (!accountId) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook due to missing account_id in payload | URL=${req.originalUrl || req.url}`,
      );
      throw new BadRequestException('Missing account_id in webhook payload');
    }

    if (!signature) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook due to missing signature header | URL=${req.originalUrl || req.url}`,
      );
      throw new UnauthorizedException('Missing webhook signature');
    }

    if (!eventId) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook due to missing event ID header | URL=${req.originalUrl || req.url}`,
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
        `[WEBHOOK] Raw body captured | size=${rawBody.length} bytes`,
      );
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Testing: JSON was parsed, stringify it back
      bodyString = JSON.stringify(req.body);
      this.logger.log(
        `[WEBHOOK] Parsed body | re-serialized for signature verification`,
      );
    } else if (typeof req.body === 'string') {
      // Testing or edge case: body is already a string
      bodyString = req.body;
    } else {
      this.logger.error(
        `[WEBHOOK] CRITICAL: req.body is not valid. ` +
          `Type: ${typeof req.body}. ` +
          `Ensure raw body parser is configured in main.ts before JSON parser.`,
      );
      throw new BadRequestException(
        'Webhook body not available. Contact support.',
      );
    }

    return this.webhookService.processWebhook(
      accountId,
      bodyString,
      signature,
      eventId,
    );
  }
}
