import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';

/**
 * Mock Razorpay service for local development (USE_MOCK_DB=true).
 * Returns realistic fake responses without calling the Razorpay API.
 */
@Injectable()
export class MockRazorpayService {
    private readonly logger = new Logger('MockRazorpayService');

    constructor(
        @Inject(DRIZZLE_TOKEN)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async createSubscriptionV2(
        userId: string,
        appId: string,
        dto: {
            plan_id?: string;
            quantity?: number;
            start_at?: number;
            flow?: 'intent' | 'collect';
            vpa?: string;
            notes: {
                email: string;
                contact: string;
                name?: string;
                description?: string;
                image?: string;
                callback_url?: string;
            };
        },
    ) {
        const { quantity = 1, flow = 'intent', vpa, notes } = dto;
        const fakeSubId = `sub_mock_${nanoid(14)}`;
        const fakeCustId = `cust_mock_${nanoid(14)}`;
        const subscriptionId = nanoid(8);
        const startAt = dto.start_at ?? Math.floor(Date.now() / 1000) + 86400;

        this.logger.log(`[MOCK Razorpay] createSubscriptionV2 for user=${userId} app=${appId}`);

        await this.db.insert(schema.subscriptions).values({
            id: subscriptionId,
            razorpaySubscriptionId: fakeSubId,
            razorpayPlanId: dto.plan_id || 'plan_mock_default',
            userId,
            appId,
            customerId: notes.email,
            razorpayCustomerId: fakeCustId,
            status: 'created',
            quantity,
            totalCount: 100,
            paidCount: 0,
            remainingCount: 100,
            startAt: new Date(startAt * 1000),
        });

        return {
            subscription: { id: fakeSubId },
            razorpaySubscription: {
                key: 'rzp_test_mock',
                subscription_id: fakeSubId,
                name: 'AlertPay Premium (MOCK)',
                description: notes.description || 'Monthly subscription',
                image: notes.image || undefined,
                callback_url: notes.callback_url || undefined,
                amount: 500,
                max_amount: 19900,
                currency: 'INR',
                prefill: { name: notes.name, email: notes.email, contact: notes.contact },
                notes,
                theme: { color: '#F37254' },
                flow,
                ...(flow === 'collect' && vpa ? { vpa } : {}),
            },
            subscriptionId,
            customerId: fakeCustId,
            message: '[MOCK] Subscription created. No real charges will occur.',
        };
    }

    async verifyPayment(
        _appId: string,
        dto: {
            razorpay_payment_id: string;
            razorpay_signature: string;
            razorpay_subscription_id?: string;
            razorpay_order_id?: string;
        },
    ) {
        this.logger.log(`[MOCK Razorpay] verifyPayment payment_id=${dto.razorpay_payment_id}`);
        return { verified: true };
    }

    getDynamicPlanId(_appId: string, _userId: string): string {
        return 'plan_mock_default';
    }
}
