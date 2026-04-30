/**
 * Webhook Controller
 * 
 * Handles incoming webhooks from Razorpay and PhonePe.
 */

import {
  Controller,
  Post,
  Body,
  Headers,
  Param,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhookHandlerService } from '../services/webhook-handler.service';
import { PaymentProvider } from '../types/provider.enum';

// ============================================================================
// Controller
// ============================================================================

/**
 * Webhook Controller
 * 
 * Endpoints:
 * - POST /webhooks/razorpay - Razorpay webhooks
 * - POST /webhooks/phonepe - PhonePe webhooks
 */
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookHandler: WebhookHandlerService) {}

  /**
   * Handle Razorpay webhooks
   * 
   * Razorpay sends webhooks with:
   * - X-Razorpay-Signature header for verification
   * - JSON body with event details
   */
  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
  ): Promise<{ received: boolean; eventId: string }> {
    this.logger.debug('Received Razorpay webhook');

    const rawBody = this.getRawBody(req, body);
    const headers = this.extractHeaders(req);

    const result = await this.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      rawBody,
      signature ?? '',
      headers,
    );

    return this.respondToResult('Razorpay', result);
  }

  /**
   * Handle PhonePe webhooks
   * 
   * PhonePe Autopay sends webhooks with:
   * - Authorization header containing SHA256(username:password) for verification
   * - JSON body with event + payload structure
   */
  @Post('phonepe')
  @HttpCode(HttpStatus.OK)
  async handlePhonePeWebhook(
    @Body() body: Record<string, unknown> | string,
    @Headers('authorization') signature: string,
    @Req() req: Request,
  ): Promise<{ received: boolean; eventId: string }> {
    this.logger.debug('Received PhonePe webhook');

    const rawBody = this.getRawBody(req, body);
    const headers = this.extractHeaders(req);

    const result = await this.webhookHandler.processWebhook(
      PaymentProvider.PHONEPE,
      rawBody,
      signature ?? '',
      headers,
    );

    return this.respondToResult('PhonePe', result);
  }

  /**
   * Handle PhonePe webhooks with app ID in path
   */
  @Post('phonepe/:appId')
  @HttpCode(HttpStatus.OK)
  async handlePhonePeWebhookWithAppId(
    @Param('appId') appId: string,
    @Body() body: Record<string, unknown> | string,
    @Headers('authorization') signature: string,
    @Req() req: Request,
  ): Promise<{ received: boolean; eventId: string }> {
    this.logger.debug(`Received PhonePe webhook for app: ${appId}`);

    const rawBody = this.getRawBody(req, body);
    const headers = this.extractHeaders(req);

    const result = await this.webhookHandler.processWebhook(
      PaymentProvider.PHONEPE,
      rawBody,
      signature ?? '',
      headers,
    );

    return this.respondToResult('PhonePe', result);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Return the appropriate response for a webhook result.
   *
   * - Signature/auth failures  -> 401 (tells provider the config is wrong, no point retrying)
   * - Processing failures      -> 200 (we received it; retrying the same payload won't help)
   * - Success                  -> 200
   */
  private respondToResult(
    provider: string,
    result: { success: boolean; eventId: string; error: string | null },
  ): { received: boolean; eventId: string } {
    if (!result.success && result.eventId === 'invalid_signature') {
      this.logger.warn(`${provider} webhook rejected: invalid signature`);
      throw new HttpException(
        { received: false, eventId: result.eventId, error: 'Invalid signature' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!result.success) {
      this.logger.error(`${provider} webhook processing failed: ${result.error}`, { eventId: result.eventId });
    }

    return { received: true, eventId: result.eventId };
  }

  /**
   * Get raw body from request
   */
  private getRawBody(
    req: Request,
    body: Record<string, unknown> | string,
  ): string | Record<string, unknown> {
    // body-parser.raw() stores the body as a Buffer on req.body
    if (Buffer.isBuffer(req.body)) {
      return req.body.toString('utf-8');
    }

    // Fallback: check for rawBody property (some middleware patterns)
    if ('rawBody' in req && (typeof req.rawBody === 'string' || Buffer.isBuffer(req.rawBody))) {
      return Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf-8') : req.rawBody;
    }

    return body;
  }

  /**
   * Extract headers from request
   */
  private extractHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};

    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key.toLowerCase()] = value;
      } else if (Array.isArray(value)) {
        headers[key.toLowerCase()] = value.join(', ');
      }
    }

    return headers;
  }
}
