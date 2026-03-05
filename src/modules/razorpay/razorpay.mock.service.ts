import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';

const MOCK_PLANS = [
  {
    id: 'plan_SL3uNUOHS4ouiR',
    entity: 'plan',
    interval: 1,
    period: 'monthly',
    item: {
      id: 'item_SL3uNTzek9YRAf',
      active: true,
      name: 'discount_for_drop_user',
      description: null,
      amount: 9900,
      unit_amount: 9900,
      currency: 'INR',
      type: 'plan',
      unit: null,
      tax_inclusive: false,
      hsn_code: null,
      sac_code: null,
      tax_rate: null,
      tax_id: null,
      tax_group_id: null,
      created_at: 1772171732,
      updated_at: 1772171732,
    },
    notes: [],
    created_at: 1772171732,
  },
  {
    id: 'plan_S3FaBrk7sjPQEU',
    entity: 'plan',
    interval: 1,
    period: 'monthly',
    item: {
      id: 'item_S3FaBqzLlQv45y',
      active: true,
      name: 'Test Plan',
      description: null,
      amount: 19900,
      unit_amount: 19900,
      currency: 'INR',
      type: 'plan',
      unit: null,
      tax_inclusive: false,
      hsn_code: null,
      sac_code: null,
      tax_rate: null,
      tax_id: null,
      tax_group_id: null,
      created_at: 1768282723,
      updated_at: 1768282723,
    },
    notes: [],
    created_at: 1768282723,
  },
  {
    id: 'plan_R7XHApPVsWrCZv',
    entity: 'plan',
    interval: 1,
    period: 'weekly',
    item: {
      id: 'item_R7XHAonIXNxGC7',
      active: true,
      name: 'Test plan - Weekly',
      description: 'Description for the test plan - Weekly',
      amount: 69900,
      unit_amount: 69900,
      currency: 'INR',
      type: 'plan',
      unit: null,
      tax_inclusive: false,
      hsn_code: null,
      sac_code: null,
      tax_rate: null,
      tax_id: null,
      tax_group_id: null,
      created_at: 1755681306,
      updated_at: 1755681306,
    },
    notes: {
      notes_key_1: 'Tea, Earl Grey, Hot',
      notes_key_2: 'Tea, Earl Grey… decaf.',
    },
    created_at: 1755681306,
  },
];

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
  ) {}

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

    this.logger.log(
      `[MOCK Razorpay] createSubscriptionV2 for user=${userId} app=${appId}`,
    );

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
        prefill: {
          name: notes.name,
          email: notes.email,
          contact: notes.contact,
        },
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
    this.logger.log(
      `[MOCK Razorpay] verifyPayment payment_id=${dto.razorpay_payment_id}`,
    );
    return { verified: true };
  }

  getDynamicPlanId(_appId: string, _userId: string): string {
    return 'plan_mock_default';
  }

  getPlans() {
    this.logger.log('[MOCK Razorpay] getPlans');
    return {
      entity: 'collection',
      count: MOCK_PLANS.length,
      items: MOCK_PLANS,
    };
  }

  getPlan(planId: string) {
    this.logger.log(`[MOCK Razorpay] getPlan planId=${planId}`);
    const plan = MOCK_PLANS.find((p) => p.id === planId);
    if (!plan) {
      throw { error: { description: 'No such plan found' } };
    }
    return plan;
  }
}
