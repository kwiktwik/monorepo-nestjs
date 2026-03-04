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
  ) {
    this.logger.log(
      `[WEBHOOK] Incoming Razorpay webhook | appId=${
        appId || 'N/A'
      } | signature=${signature ? 'present' : 'missing'} | content-type=${
        (req.headers['content-type'] as string) || 'N/A'
      }`,
    );

    if (!appId) {
      this.logger.warn(
        '[WEBHOOK] Rejected webhook due to missing appId in query params',
      );
      throw new BadRequestException('App ID is required');
    }

    if (!signature) {
      this.logger.warn(
        `[WEBHOOK] Rejected webhook for appId=${appId} due to missing signature header`,
      );
      throw new UnauthorizedException('Missing webhook signature');
    }

    // Get raw body from the request (set by raw body parser middleware)
    const reqWithRawBody = req as { rawBody?: Buffer; body: unknown };
    const rawBody = reqWithRawBody.rawBody || reqWithRawBody.body;
    console.log('[Razorpay] Request type:', {
      hasRawBody: !!reqWithRawBody.rawBody,
      bodyType: typeof reqWithRawBody.body,
      isBuffer: Buffer.isBuffer(reqWithRawBody.rawBody),
    });
    const bodyString = Buffer.isBuffer(rawBody)
      ? rawBody.toString('utf-8')
      : JSON.stringify(rawBody);

    const rawLength = Buffer.isBuffer(rawBody)
      ? rawBody.length
      : ((rawBody as { length?: number })?.length ?? 0);
    this.logger.log(
      `[WEBHOOK] Parsed request body for appId=${appId} | isBuffer=${Buffer.isBuffer(
        rawBody,
      )} | rawLength=${rawLength} | bodyStringLength=${
        bodyString?.length ?? 0
      }`,
    );

    return this.webhookService.processWebhook(appId, bodyString, signature);
  }
}
