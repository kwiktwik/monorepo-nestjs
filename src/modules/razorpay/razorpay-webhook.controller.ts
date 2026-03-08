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

    // Get raw body from the request (set by raw body parser middleware)
    const reqWithRawBody = req as { rawBody?: Buffer; body?: unknown };
    
    // CRITICAL: Raw body MUST be a Buffer for signature verification
    // The signature is computed on exact bytes, so JSON.stringify() won't work
    if (!Buffer.isBuffer(reqWithRawBody.rawBody)) {
      this.logger.error(
        `[WEBHOOK] CRITICAL: Raw body is not a Buffer for appId=${appId}. ` +
        `This will cause signature verification to fail. ` +
        `Ensure raw body middleware is configured correctly.`
      );
      throw new BadRequestException(
        'Webhook raw body not available. Contact support.'
      );
    }
    
    const rawBody = reqWithRawBody.rawBody;
    const bodyString = rawBody.toString('utf-8');
    
    this.logger.log(
      `[WEBHOOK] Raw body captured for appId=${appId} | size=${rawBody.length} bytes | bodyLength=${bodyString.length} chars`,
    );

    return this.webhookService.processWebhook(
      appId,
      bodyString,
      signature,
      eventId,
    );
  }
}
