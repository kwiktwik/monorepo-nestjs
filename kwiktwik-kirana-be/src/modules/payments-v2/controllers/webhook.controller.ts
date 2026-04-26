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

    if (!result.success) {
      this.logger.error(`Razorpay webhook processing failed: ${result.error}`);
      throw new HttpException(
        { received: false, eventId: result.eventId, error: result.error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      received: true,
      eventId: result.eventId,
    };
  }

  /**
   * Handle PhonePe webhooks
   * 
   * PhonePe sends webhooks with:
   * - X-VERIFY header for signature verification
   * - Base64 encoded JSON body
   */
  @Post('phonepe')
  @HttpCode(HttpStatus.OK)
  async handlePhonePeWebhook(
    @Body() body: Record<string, unknown> | string,
    @Headers('x-verify') signature: string,
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

    if (!result.success) {
      this.logger.error(`PhonePe webhook processing failed: ${result.error}`);
      throw new HttpException(
        { received: false, eventId: result.eventId, error: result.error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      received: true,
      eventId: result.eventId,
    };
  }

  /**
   * Handle PhonePe webhooks with app ID in path
   */
  @Post('phonepe/:appId')
  @HttpCode(HttpStatus.OK)
  async handlePhonePeWebhookWithAppId(
    @Param('appId') appId: string,
    @Body() body: Record<string, unknown> | string,
    @Headers('x-verify') signature: string,
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

    if (!result.success) {
      this.logger.error(`PhonePe webhook processing failed: ${result.error}`);
      throw new HttpException(
        { received: false, eventId: result.eventId, error: result.error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      received: true,
      eventId: result.eventId,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Get raw body from request
   */
  private getRawBody(
    req: Request,
    body: Record<string, unknown> | string,
  ): string | Record<string, unknown> {
    // Try to get raw body from request
    if ('rawBody' in req && typeof req.rawBody === 'string') {
      return req.rawBody;
    }

    // Return parsed body
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
