import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import Razorpay from 'razorpay';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';
import { getConfigForAppId } from '../config/config.data';

interface RazorpayCredentials {
  key_id: string;
  key_secret: string;
}

@Injectable()
export class RazorpayService {
  private razorpayInstances: Map<string, Razorpay> = new Map();

  constructor(
    private config: ConfigService,
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get Razorpay credentials for a specific app
   * Environment variable naming convention:
   * - App-specific: RAZORPAY_KEY_ID_{APP_ID}, RAZORPAY_KEY_SECRET_{APP_ID}
   *   where APP_ID is normalized (dots replaced with underscores, uppercase)
   *
   * Note: API will fail if no app-specific credentials are found. No fallback to default.
   */
  private getCredentials(appId: string): RazorpayCredentials {
    if (!appId) {
      throw new InternalServerErrorException(
        'App ID is required. Please provide X-App-ID header.',
      );
    }

    // Normalize app ID for environment variable naming
    const normalizedAppId = appId.replace(/\./g, '_').toUpperCase();

    // Get app-specific credentials
    const appSpecificKeyId = this.config.get<string>(
      `RAZORPAY_KEY_ID_${normalizedAppId}`,
    );
    const appSpecificKeySecret = this.config.get<string>(
      `RAZORPAY_KEY_SECRET_${normalizedAppId}`,
    );

    if (appSpecificKeyId && appSpecificKeySecret) {
      return {
        key_id: appSpecificKeyId,
        key_secret: appSpecificKeySecret,
      };
    }

    // No fallback - fail if app-specific credentials are not found
    throw new InternalServerErrorException(
      `Razorpay credentials not found for app: ${appId}. Please set RAZORPAY_KEY_ID_${normalizedAppId} and RAZORPAY_KEY_SECRET_${normalizedAppId} environment variables.`,
    );
  }

  /**
   * Get or create Razorpay instance for a specific app
   */
  private getRazorpayInstance(appId: string): Razorpay {
    if (!this.razorpayInstances.has(appId)) {
      const credentials = this.getCredentials(appId);
      const instance = new Razorpay({
        key_id: credentials.key_id,
        key_secret: credentials.key_secret,
      });
      this.razorpayInstances.set(appId, instance);
    }
    return this.razorpayInstances.get(appId)!;
  }

  /**
   * Get the key ID for a specific app (used for client-side)
   */
  private getKeyId(appId: string): string {
    const credentials = this.getCredentials(appId);
    return credentials.key_id;
  }

  /**
   * Get the key secret for a specific app (used for signature verification)
   */
  private getKeySecret(appId: string): string {
    const credentials = this.getCredentials(appId);
    return credentials.key_secret;
  }

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
    const email = notes.email;
    const contact = notes.contact;

    const plan_id = dto.plan_id || this.getDefaultPlanId(appId);

    if (!email || !contact) {
      throw new BadRequestException('email and contact are required in notes');
    }

    if (flow === 'collect' && !vpa) {
      throw new BadRequestException(
        'vpa (UPI ID) is required for collect flow',
      );
    }

    if (flow !== 'intent' && flow !== 'collect') {
      throw new BadRequestException(
        "flow must be either 'intent' or 'collect'",
      );
    }

    const razorpay = this.getRazorpayInstance(appId);

    // Fetch plan details from Razorpay
    let planDetails: { item: { amount: number; currency: string } };
    try {
      planDetails = (await razorpay.plans.fetch(plan_id)) as {
        item: { amount: number; currency: string };
      };
    } catch (error) {
      const err = error as { error?: { description?: string } };
      throw new BadRequestException(
        err?.error?.description || 'Invalid plan_id',
      );
    }

    const total_count = 100;

    // Find or create customer
    let customerId: string;
    try {
      const customer = await razorpay.customers.create({
        name: email,
        email,
        contact,
        fail_existing: 0,
        notes,
      });
      customerId = customer.id;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create or find customer',
      );
    }

    // Calculate start_at
    const nowSeconds = Math.floor(Date.now() / 1000);
    const defaultStartAt = nowSeconds + 60 * 60 * 24;
    let subscriptionStartAt = dto.start_at ?? defaultStartAt;
    if (subscriptionStartAt > 4765046400 * 1000) {
      subscriptionStartAt = Math.floor(subscriptionStartAt / 1000);
    }

    // Create subscription
    let subscription: { id: string; [key: string]: unknown };
    try {
      subscription = (await razorpay.subscriptions.create({
        plan_id,
        customer_notify: true,
        quantity,
        total_count,
        start_at: subscriptionStartAt,
        notes,
      })) as unknown as { id: string; [key: string]: unknown };
    } catch (error) {
      const err = error as { error?: { description?: string } };
      throw new BadRequestException(
        err?.error?.description || 'Failed to create subscription',
      );
    }

    const subscriptionId = nanoid(8);

    await this.db.insert(schema.subscriptions).values({
      id: subscriptionId,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: plan_id,
      userId,
      appId,
      customerId: email,
      razorpayCustomerId: customerId,
      status: 'created',
      quantity,
      totalCount: total_count,
      paidCount: 0,
      remainingCount: total_count,
      startAt: new Date(subscriptionStartAt * 1000),
      endAt: subscription.end_at
        ? new Date(Number(subscription.end_at) * 1000)
        : null,
      chargeAt: subscription.charge_at
        ? new Date(Number(subscription.charge_at) * 1000)
        : null,
      currentStart: subscription.current_start
        ? new Date(Number(subscription.current_start) * 1000)
        : null,
      currentEnd: subscription.current_end
        ? new Date(Number(subscription.current_end) * 1000)
        : null,
      notes: notes,
      metadata: subscription,
    });

    const keyId = this.getKeyId(appId);
    const maxAmount = planDetails?.item?.amount ?? 19900;

    return {
      subscription,
      razorpaySubscription: {
        key: keyId,
        subscription_id: subscription.id,
        name: 'AlertPay Premium',
        description: notes.description || 'Monthly subscription',
        image: notes.image || undefined,
        callback_url: notes.callback_url || undefined,
        amount: 500,
        max_amount: maxAmount,
        currency: planDetails?.item?.currency || 'INR',
        prefill: {
          name: notes.name || undefined,
          email,
          contact,
        },
        notes,
        theme: {
          color: '#F37254',
        },
        flow,
        ...(flow === 'collect' && vpa ? { vpa } : {}),
      },
      subscriptionId,
      customerId,
      message:
        'Subscription created successfully. First payment of ₹5 will be charged immediately.',
    };
  }

  async verifyPayment(
    appId: string,
    dto: {
      razorpay_payment_id: string;
      razorpay_signature: string;
      razorpay_subscription_id?: string;
      razorpay_order_id?: string;
    },
  ) {
    const { razorpay_payment_id, razorpay_signature } = dto;
    const subscriptionId = dto.razorpay_subscription_id;
    const orderId = dto.razorpay_order_id;

    if (!subscriptionId && !orderId) {
      throw new BadRequestException(
        'Either razorpay_subscription_id or razorpay_order_id is required',
      );
    }

    const keySecret = this.getKeySecret(appId);
    if (!keySecret) {
      throw new InternalServerErrorException(
        `Razorpay key secret not found for app: ${appId}`,
      );
    }

    const body = subscriptionId
      ? `${razorpay_payment_id}|${subscriptionId}`
      : `${orderId}|${razorpay_payment_id}`;

    const expectedSignature = createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new UnauthorizedException('Invalid payment signature');
    }

    if (subscriptionId) {
      const result = await this.db
        .update(schema.subscriptions)
        .set({
          status: 'active',
          paidCount: sql`${schema.subscriptions.paidCount} + 1`,
          remainingCount: sql`${schema.subscriptions.totalCount} - ${schema.subscriptions.paidCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.subscriptions.razorpaySubscriptionId, subscriptionId))
        .returning({ id: schema.subscriptions.id });

      if (result.length === 0) {
        throw new BadRequestException('Subscription not found');
      }
    }

    return { verified: true };
  }

  private getDefaultPlanId(appId: string): string {
    const config = getConfigForAppId(appId);
    if (!config?.features?.subscription?.plan_id) {
      throw new BadRequestException(
        `No default subscription plan found for app: ${appId}`,
      );
    }
    return config.features.subscription.plan_id;
  }

  getDynamicPlanId(
    appId: string,
    userId: string,
    options?: { isTrial?: boolean; userSegment?: string },
  ): string {
    const config = getConfigForAppId(appId);
    const defaultPlanId = this.getDefaultPlanId(appId);

    if (options?.isTrial) {
      const trialPlanId = config?.features?.subscription?.trial_plan_id;
      if (trialPlanId) {
        return trialPlanId;
      }
      return defaultPlanId;
    }

    if (options?.userSegment) {
      const segmentPlans = config?.features?.subscription?.segment_plans;
      const segmentPlanId = segmentPlans?.[options.userSegment];
      if (segmentPlanId) {
        return segmentPlanId;
      }
    }

    return defaultPlanId;
  }

  async getPlans(appId: string) {
    const razorpay = this.getRazorpayInstance(appId);
    return razorpay.plans.all();
  }

  async getPlan(appId: string, planId: string) {
    const razorpay = this.getRazorpayInstance(appId);
    return razorpay.plans.fetch(planId);
  }
}
