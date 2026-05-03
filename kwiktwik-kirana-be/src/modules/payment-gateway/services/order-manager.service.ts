/**
 * Order Manager Service
 *
 * Orchestrates one-time order lifecycle across different providers.
 * Follows the same patterns as SubscriptionManagerService.
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ProviderFactory } from '../providers/factory/provider.factory';
import { PaymentConfigService } from '../config/payment-config.service';
import { EntitlementService } from './entitlement.service';

import type { IEventBus } from '../common/events/event-bus.interface';
import { PaymentEventTypes, createPaymentEvent, generateCorrelationId } from '../common/events/event-bus.interface';
import type { IOrderRepository } from '../infrastructure/repositories/order.repository.interface';
import type { Order } from '../domain/entities/order.entity';
import { createOrder, markOrderAsPaid, markOrderAsFailed, markOrderAsRefunded } from '../domain/entities/order.entity';
import type { PaymentProvider } from '../types/provider.enum';
import { generateMerchantOrderId, generateId, generateMerchantRefundId } from '../providers/base/provider-utils';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import { paymentTransactions } from '../database/schema';

// ============================================================================
// Types
// ============================================================================

export interface CreateOneTimeOrderInput {
  readonly userId: string;
  readonly appId: string;
  readonly provider: PaymentProvider;
  readonly amount: number;
  readonly currency?: string;
  readonly receipt?: string;
  readonly notes?: Record<string, string>;
  readonly redirectUrl?: string;
  readonly contact?: string;
  readonly planId?: string;
}

export interface CreateOneTimeOrderResult {
  readonly success: boolean;
  readonly order: Order | null;
  readonly providerOrderId: string | null;
  readonly redirectUrl: string | null;
  readonly checkoutConfig: Record<string, unknown>;
  readonly error: string | null;
}

export interface VerifyOneTimePaymentInput {
  readonly orderId: string;
  readonly providerPaymentId: string;
  readonly signature: string;
}

export interface VerifyOneTimePaymentResult {
  readonly success: boolean;
  readonly order: Order | null;
  readonly error: string | null;
}

export interface RefundOneTimeOrderInput {
  readonly orderId: string;
  readonly amount?: number;
  readonly reason?: string;
}

export interface RefundOneTimeOrderResult {
  readonly success: boolean;
  readonly order: Order | null;
  readonly refundId: string | null;
  readonly error: string | null;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class OrderManagerService {
  private readonly logger = new Logger(OrderManagerService.name);

  constructor(
    private readonly providerFactory: ProviderFactory,
    private readonly configService: PaymentConfigService,
    private readonly entitlementService: EntitlementService,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @Inject('IEventBus') @Optional() private readonly eventBus: IEventBus | null,
    @Inject(DRIZZLE_TOKEN) @Optional() private readonly db: NodePgDatabase<any> | null,
  ) {}

  async createOrder(input: CreateOneTimeOrderInput): Promise<CreateOneTimeOrderResult> {
    return this.executeCreateOrder(input);
  }

  private async executeCreateOrder(input: CreateOneTimeOrderInput): Promise<CreateOneTimeOrderResult> {
    try {
      const config = this.configService.getConfig({
        appId: input.appId,
        provider: input.provider,
      });

      if (!config) {
        return { success: false, order: null, providerOrderId: null, redirectUrl: null, checkoutConfig: {}, error: 'Configuration not found' };
      }

      const provider = this.providerFactory.getOneTimeOrderProvider(input.provider, config);
      const merchantOrderId = generateMerchantOrderId();

      const providerResult = await provider.createOrder({
        merchantOrderId,
        amount: input.amount,
        currency: input.currency ?? 'INR',
        receipt: input.receipt,
        notes: input.notes,
        redirectUrl: input.redirectUrl,
        contact: input.contact,
      });

      const order = createOrder({
        id: generateId('ord'),
        merchantOrderId,
        userId: input.userId,
        appId: input.appId,
        orderType: 'ONE_TIME',
        subscriptionType: 'USER_MANAGED',
        provider: input.provider,
        configId: config.configId,
        environment: config.environment,
        amount: input.amount,
        currency: input.currency,
        planId: input.planId,
        providerData: {
          orderId: providerResult.providerOrderId,
        },
        expiresAt: providerResult.expiresAt ?? undefined,
        notes: input.notes,
      });

      await this.orderRepository.save(order);

      if (!providerResult.success) {
        this.logger.warn(`Failed to create order with provider: ${providerResult.error}`);
        return {
          success: false,
          order,
          providerOrderId: null,
          redirectUrl: null,
          checkoutConfig: {},
          error: providerResult.error,
        };
      }

      this.logger.log(`Created one-time order ${order.id} via ${input.provider}`);

      this.publishEvent(PaymentEventTypes.ORDER_CREATED, {
        orderId: order.id,
        merchantOrderId,
        userId: input.userId,
        appId: input.appId,
        provider: input.provider,
        amount: input.amount,
        currency: input.currency ?? 'INR',
      }, input.appId, input.userId, input.provider);

      return {
        success: true,
        order,
        providerOrderId: providerResult.providerOrderId,
        redirectUrl: providerResult.redirectUrl,
        checkoutConfig: providerResult.checkoutConfig,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, order: null, providerOrderId: null, redirectUrl: null, checkoutConfig: {}, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async verifyPayment(input: VerifyOneTimePaymentInput): Promise<VerifyOneTimePaymentResult> {
    try {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) {
        return { success: false, order: null, error: 'Order not found' };
      }

      if (order.status === 'CAPTURED') {
        return { success: true, order, error: null };
      }

      const config = this.configService.getConfig({
        appId: order.appId,
        provider: order.provider,
      });

      if (!config) {
        return { success: false, order, error: 'Configuration not found' };
      }

      const provider = this.providerFactory.getOneTimeOrderProvider(order.provider, config);

      const verifyResult = await provider.verifyPayment({
        merchantOrderId: order.merchantOrderId,
        providerOrderId: order.providerData.orderId,
        providerPaymentId: input.providerPaymentId,
        signature: input.signature,
      });

      if (!verifyResult.verified) {
        return { success: false, order, error: verifyResult.error };
      }

      const updatedOrder = markOrderAsPaid(order, input.providerPaymentId, {
        paymentId: input.providerPaymentId,
      });

      await this.orderRepository.save(updatedOrder);

      await this.recordPaymentTransaction({
        orderId: updatedOrder.id,
        provider: order.provider,
        providerTransactionId: input.providerPaymentId,
        amount: order.amount,
        currency: order.currency,
        status: 'SUCCESS',
      });

      // Grant entitlement for ONE_TIME orders with a plan
      if (order.orderType === 'ONE_TIME' && order.planId) {
        const planConfig = await this.configService.getPlanConfig(order.appId, order.planId);
        if (planConfig?.premiumDurationDays) {
          await this.entitlementService.grantFromOrder({
            orderId: order.id,
            userId: order.userId,
            appId: order.appId,
            planId: order.planId,
            durationDays: planConfig.premiumDurationDays,
          });
        }
      }

      this.publishEvent(PaymentEventTypes.PAYMENT_SUCCESSFUL, {
        orderId: updatedOrder.id,
        merchantOrderId: order.merchantOrderId,
        userId: order.userId,
        appId: order.appId,
        provider: order.provider,
        amount: order.amount,
        currency: order.currency,
        paymentId: input.providerPaymentId,
      }, order.appId, order.userId, order.provider);

      return { success: true, order: updatedOrder, error: null };
    } catch (error) {
      this.logger.error(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, order: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getOrderStatus(orderId: string): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
  }

  async syncOrderStatus(orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return null;

    if (order.status === 'CAPTURED' || order.status === 'REFUNDED') {
      return order;
    }

    if (!order.providerData.orderId) {
      this.logger.warn(`Order ${orderId} has no provider order ID, cannot sync`);
      return order;
    }

    const config = this.configService.getConfig({
      appId: order.appId,
      provider: order.provider,
    });
    if (!config) return order;

    try {
      const provider = this.providerFactory.getOneTimeOrderProvider(order.provider, config);

      const statusResult = await provider.getOrderStatus({
        merchantOrderId: order.merchantOrderId,
        providerOrderId: order.providerData.orderId,
      });

      if (statusResult.mappedStatus === 'CAPTURED') {
        const paymentId = statusResult.paymentDetails[0]?.transactionId ?? '';
        const updated = markOrderAsPaid(order, paymentId);
        await this.orderRepository.save(updated);
        return updated;
      }

      if (statusResult.mappedStatus === 'FAILED' && order.status !== 'FAILED') {
        const updated = markOrderAsFailed(order, 'Provider reported failure');
        await this.orderRepository.save(updated);
        return updated;
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync order ${orderId} with provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return order;
  }

  async refundOrder(input: RefundOneTimeOrderInput): Promise<RefundOneTimeOrderResult> {
    try {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) {
        return { success: false, order: null, refundId: null, error: 'Order not found' };
      }

      if (order.status !== 'CAPTURED') {
        return { success: false, order, refundId: null, error: `Order cannot be refunded in status: ${order.status}` };
      }

      const config = this.configService.getConfig({
        appId: order.appId,
        provider: order.provider,
      });
      if (!config) {
        return { success: false, order, refundId: null, error: 'Configuration not found' };
      }

      const provider = this.providerFactory.getOneTimeOrderProvider(order.provider, config);
      const merchantRefundId = generateMerchantRefundId();

      const refundResult = await provider.refundPayment({
        providerPaymentId: order.providerData.paymentId ?? order.providerData.orderId,
        amount: input.amount ?? order.amount,
        reason: input.reason ?? null,
        merchantRefundId,
      });

      if (!refundResult.success) {
        return { success: false, order, refundId: null, error: refundResult.error };
      }

      const updatedOrder = markOrderAsRefunded(order, refundResult.refundId);
      await this.orderRepository.save(updatedOrder);

      // Revoke entitlement on refund
      if (order.orderType === 'ONE_TIME' && order.planId) {
        await this.entitlementService.revokeFromOrder(order.id, 'order_refunded');
      }

      await this.recordPaymentTransaction({
        orderId: updatedOrder.id,
        provider: order.provider,
        providerTransactionId: refundResult.refundId,
        amount: input.amount ?? order.amount,
        currency: order.currency,
        status: 'REFUNDED',
      });

      this.publishEvent(PaymentEventTypes.PAYMENT_REFUNDED, {
        orderId: updatedOrder.id,
        merchantOrderId: order.merchantOrderId,
        userId: order.userId,
        appId: order.appId,
        provider: order.provider,
        refundId: refundResult.refundId,
        amount: input.amount ?? order.amount,
        currency: order.currency,
      }, order.appId, order.userId, order.provider);

      return { success: true, order: updatedOrder, refundId: refundResult.refundId, error: null };
    } catch (error) {
      this.logger.error(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, order: null, refundId: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async recordPaymentTransaction(params: {
    orderId: string;
    provider: string;
    providerTransactionId: string;
    amount: number;
    currency: string;
    status: string;
  }): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.insert(paymentTransactions).values({
        id: generateId('txn'),
        orderId: params.orderId,
        subscriptionId: null,
        provider: params.provider as any,
        providerTransactionId: params.providerTransactionId,
        amount: params.amount,
        currency: params.currency,
        status: params.status,
        paymentMethod: null,
        errorCode: null,
        errorMessage: null,
        transactionAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to record transaction for order ${params.orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private publishEvent(
    eventType: string,
    payload: Record<string, unknown>,
    appId: string,
    userId?: string,
    provider?: string,
  ): void {
    if (!this.eventBus) return;

    try {
      const event = createPaymentEvent(eventType, payload, {
        correlationId: generateCorrelationId(),
        source: 'OrderManagerService',
        timestamp: new Date(),
        appId,
        userId,
        provider,
      });
      this.eventBus.publish(event).catch((err) => {
        this.logger.error(`Failed to publish event ${eventType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
    } catch (error) {
      this.logger.error(`Failed to create event ${eventType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}