/**
 * Payment Service Facade
 *
 * High-level service for payment operations.
 * Loosely coupled: Only depends on NestJS ConfigService.
 */

import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  paymentConfigRegistry,
  PaymentConfigRegistry,
} from '../config/config-registry';
import { PaymentProviderFactory } from '../factory/payment-provider.factory';
import { loadPaymentConfigs } from '../config/config-loader';
import type { PaymentProvider } from '../types/payment-provider.interface';
import type {
  CreateOrderParams,
  OrderResult,
  VerifyPaymentParams,
  VerifyResult,
  CreateSubscriptionParams,
  SubscriptionResult,
  HandleWebhookParams,
  WebhookResult,
  RefundResult,
} from '../types/common.types';
import type { PaymentProviderType } from '../types/payment-config.types';
import { ConfigError } from '../types/payment-provider.interface';

@Injectable()
export class PaymentService {
  private registry: PaymentConfigRegistry;

  constructor(@Optional() private configService?: ConfigService) {
    this.registry = paymentConfigRegistry;
  }

  /**
   * Initialize by loading configs from environment (via ConfigService or process.env)
   */
  initializeFromEnv(): void {
    const source = this.configService ?? { get: (k: string) => process.env[k] };
    const configs = loadPaymentConfigs(source);
    this.registry.registerMany(configs);
  }

  registerConfig(config: any): void {
    this.registry.register(config);
  }

  getProvider(provider: PaymentProviderType, appId: string): PaymentProvider {
    const config = this.registry.get(provider, appId, {
      fallbackToDefault: true,
    });
    if (!config) {
      throw new ConfigError(
        `No config found for provider ${provider} and app ${appId}`,
        appId,
        provider,
      );
    }
    return PaymentProviderFactory.createProvider(config);
  }

  async createOrder(
    provider: PaymentProviderType,
    params: CreateOrderParams,
  ): Promise<OrderResult> {
    return this.getProvider(provider, params.appId).createOrder(params);
  }

  async verifyPayment(
    provider: PaymentProviderType,
    params: VerifyPaymentParams,
  ): Promise<VerifyResult> {
    return this.getProvider(provider, params.appId).verifyPayment(params);
  }

  async createSubscription(
    provider: PaymentProviderType,
    params: CreateSubscriptionParams,
  ): Promise<SubscriptionResult> {
    const p = this.getProvider(provider, params.appId);
    if (!p.createSubscription)
      throw new Error(`${provider} does not support subscriptions`);
    return p.createSubscription(params);
  }

  async handleWebhook(
    provider: PaymentProviderType,
    params: HandleWebhookParams,
  ): Promise<WebhookResult> {
    return this.getProvider(provider, params.appId).handleWebhook(params);
  }

  async refund(
    provider: PaymentProviderType,
    appId: string,
    orderId: string,
    amount?: number,
  ): Promise<RefundResult> {
    const p = this.getProvider(provider, appId);
    if (!p.refund) throw new Error(`${provider} does not support refunds`);
    return p.refund(orderId, amount);
  }

  async checkOrderStatus(
    provider: PaymentProviderType,
    appId: string,
    orderId: string,
  ): Promise<OrderResult> {
    const p = this.getProvider(provider, appId);
    if (!p.checkOrderStatus)
      throw new Error(`${provider} does not support order status check`);
    return p.checkOrderStatus(orderId);
  }

  getPublicConfig(
    provider: PaymentProviderType,
    appId: string,
  ): Record<string, unknown> {
    return this.getProvider(provider, appId).getPublicConfig();
  }

  async healthCheck(
    provider: PaymentProviderType,
    appId: string,
  ): Promise<{ healthy: boolean; message?: string }> {
    const p = this.getProvider(provider, appId);
    if (!p.healthCheck)
      return { healthy: true, message: 'No health check implemented' };
    return p.healthCheck();
  }
}
