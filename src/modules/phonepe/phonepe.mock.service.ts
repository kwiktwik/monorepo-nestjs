import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';
import type { PaymentModeConfig } from './phonepe.service';

/**
 * Mock PhonePe service for local development (USE_MOCK_DB=true).
 * Returns realistic fake responses without calling the PhonePe API.
 */
@Injectable()
export class MockPhonePeService {
    private readonly logger = new Logger('MockPhonePeService');

    constructor(
        @Inject(DRIZZLE_TOKEN)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    getSdkConfig(userId: string, _appId: string) {
        this.logger.log(`[MOCK PhonePe] getSdkConfig userId=${userId}`);
        return {
            environment: 'SANDBOX',
            merchantId: 'MOCK_MERCHANT',
            flowId: userId,
            enableLogging: true,
        };
    }

    async createOrder(
        userId: string,
        appId: string,
        dto: { amount: number; redirectUrl: string; disablePaymentRetry?: boolean; paymentMode?: PaymentModeConfig },
    ) {
        if (!dto.amount || dto.amount <= 0) throw new BadRequestException('Valid amount is required');
        const merchantOrderId = nanoid(10);
        const fakePhonePeOrderId = `mock_order_${nanoid(12)}`;
        this.logger.log(`[MOCK PhonePe] createOrder merchantOrderId=${merchantOrderId}`);

        await this.db.insert(schema.orders).values({
            id: merchantOrderId,
            userId,
            appId,
            customerId: userId,
            amount: Math.round(dto.amount * 100),
            status: 'created',
        });

        return {
            orderId: merchantOrderId,
            phonepeOrderId: fakePhonePeOrderId,
            state: 'PENDING',
            expireAt: Date.now() + 20 * 60 * 1000,
            token: `mock_token_${nanoid(16)}`,
            paymentMode: { type: dto.paymentMode?.type || 'UPI_INTENT' },
        };
    }

    async createOrderWithAuth(
        userId: string,
        appId: string,
        dto: { redirectUrl: string; disablePaymentRetry?: boolean; paymentMode?: PaymentModeConfig },
    ) {
        const merchantOrderId = nanoid(10);
        this.logger.log(`[MOCK PhonePe] createOrderWithAuth merchantOrderId=${merchantOrderId}`);

        await this.db.insert(schema.orders).values({
            id: merchantOrderId,
            userId,
            appId,
            customerId: userId,
            amount: 500,
            status: 'created',
        });

        return {
            merchantOrderId,
            orderId: `mock_pp_order_${nanoid(10)}`,
            merchantId: 'MOCK_MERCHANT',
            token: `mock_token_${nanoid(16)}`,
            merchantSubscriptionId: null,
            paymentMode: { type: dto.paymentMode?.type || 'UPI_INTENT' },
            localOrderId: merchantOrderId,
            authToken: { access_token: `mock_access_${nanoid(16)}`, expires_at: Date.now() + 3600000 },
        };
    }

    async initiatePayment(
        userId: string,
        appId: string,
        dto: { amount: number; redirectUrl: string; message?: string },
    ) {
        const merchantOrderId = nanoid(10);
        this.logger.log(`[MOCK PhonePe] initiatePayment merchantOrderId=${merchantOrderId}`);

        await this.db.insert(schema.orders).values({
            id: merchantOrderId,
            userId,
            appId,
            customerId: userId,
            amount: Math.round(dto.amount * 100),
            status: 'created',
        });

        return {
            orderId: merchantOrderId,
            redirectUrl: `${dto.redirectUrl}?mock=true&orderId=${merchantOrderId}`,
            merchantOrderId,
        };
    }

    async checkStatus(
        _appId: string,
        merchantOrderId: string,
        _type: 'standard' | 'mobile' = 'standard',
    ) {
        this.logger.log(`[MOCK PhonePe] checkStatus merchantOrderId=${merchantOrderId}`);
        return {
            orderId: merchantOrderId,
            state: 'COMPLETED',
            phonepeOrderId: `mock_pp_${merchantOrderId}`,
            amount: 50000,
            transactionId: `mock_txn_${nanoid(10)}`,
            paymentMode: 'UPI_INTENT',
        };
    }

    async getAuthToken(_appId: string) {
        return {
            access_token: `mock_access_${nanoid(16)}`,
            expires_at: Date.now() + 3600000,
            token_type: 'Bearer',
        };
    }

    async createOrderToken(
        userId: string,
        appId: string,
        dto: { amount: number; merchantOrderId?: string; redirectUrl?: string },
    ) {
        const merchantOrderId = dto.merchantOrderId || nanoid(10);
        this.logger.log(`[MOCK PhonePe] createOrderToken merchantOrderId=${merchantOrderId}`);

        await this.db.insert(schema.orders).values({
            id: merchantOrderId,
            userId,
            appId,
            customerId: userId,
            amount: Math.round(dto.amount * 100),
            status: 'created',
        });

        return {
            token: `mock_token_${nanoid(16)}`,
            orderId: `mock_pp_${nanoid(12)}`,
            localOrderId: merchantOrderId,
        };
    }

    async setupSubscription(
        userId: string,
        appId: string,
        dto: {
            amount?: number;
            maxAmount: number;
            frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
            redirectUrl: string;
            merchantSubscriptionId?: string;
        },
    ) {
        const merchantSubscriptionId = dto.merchantSubscriptionId || nanoid(10);
        const merchantOrderId = nanoid(10);
        this.logger.log(`[MOCK PhonePe] setupSubscription merchantSubscriptionId=${merchantSubscriptionId}`);

        await this.db.insert(schema.phonepeSubscriptions).values({
            id: nanoid(10),
            merchantSubscriptionId,
            userId,
            appId,
            phonepeSubscriptionId: `mock_sub_${nanoid(10)}`,
            amount: dto.amount ? Math.round(dto.amount * 100) : 0,
            amountType: 'VARIABLE',
            frequency: dto.frequency,
            state: 'CREATED' as const,
        });

        return {
            token: `mock_token_${nanoid(16)}`,
            orderId: `mock_pp_${nanoid(12)}`,
            localOrderId: merchantOrderId,
            merchantSubscriptionId,
            merchantOrderId,
        };
    }
}
