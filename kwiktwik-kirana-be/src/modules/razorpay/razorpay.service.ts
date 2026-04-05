import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import Razorpay from 'razorpay';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { orderStatusEnum } from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';
import { getConfigForAppId } from '../config/config.data';
import { RazorpaySubscriptionStatuses, RazorpayOrderStatuses, type RazorpayOrderStatus, type RazorpaySubscriptionEntity, type RazorpaySubscriptionStatus } from '../../common/types/razorpay.types';

interface RazorpayCredentials {
  key_id: string;
  key_secret: string;
}

interface RazorpayCustomer {
  id: string;
  entity: string;
  name: string;
  email: string;
  contact: string;
  gstin: string | null;
  notes: Record<string, string>;
  shipping_address: unknown[];
  created_at: number;
}

interface RazorpayCreateCustomerParams {
  name: string;
  email: string;
  contact: string;
  fail_existing?: string; // '0' = return existing, '1' = throw if exists (default)
  notes?: Record<string, unknown>;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
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
    const { quantity = 1, flow = 'intent', vpa, notes: rawNotes } = dto;
    const notes = { ...rawNotes, db: 'kirana-kwiktwik-be' };
    const email = notes.email;
    const contact = notes.contact;

    this.logger.log(
      `[createSubscriptionV2] START | userId=${userId} appId=${appId} flow=${flow} plan_id=${dto.plan_id ?? 'auto'} is_trial=${dto.plan_id ?? '-'} user_segment=${dto.plan_id ?? '-'}`,
    );
    this.logger.log(
      `[createSubscriptionV2] DTO notes: email=${email} contact=${contact} name=${notes.name ?? '-'}`,
    );

    const plan_id = dto.plan_id || this.getDefaultPlanId(appId);
    this.logger.log(`[createSubscriptionV2] Resolved plan_id=${plan_id}`);

    if (!email || !contact) {
      this.logger.warn(
        `[createSubscriptionV2] ❌ Missing email or contact | email=${email} contact=${contact}`,
      );
      throw new BadRequestException('email and contact are required in notes');
    }

    if (flow === 'collect' && !vpa) {
      this.logger.warn(
        `[createSubscriptionV2] ❌ collect flow requires vpa but vpa is missing`,
      );
      throw new BadRequestException(
        'vpa (UPI ID) is required for collect flow',
      );
    }

    if (flow !== 'intent' && flow !== 'collect') {
      this.logger.warn(
        `[createSubscriptionV2] ❌ Invalid flow value: '${String(flow)}'`,
      );
      throw new BadRequestException(
        "flow must be either 'intent' or 'collect'",
      );
    }

    // Block if user already has a blocking subscription.
    // Statuses and why each is blocked:
    //   'active'        → subscription is live and billing
    //   'authenticated' → user completed UPI mandate, webhook may just be delayed
    //   'created'       → subscription exists on Razorpay; if created within the
    //                     last 24h it likely means payment happened but webhook
    //                     was missed. Older 'created' rows are treated as abandoned.
    this.logger.log(
      `[createSubscriptionV2] Checking for blocking subscription | userId=${userId} appId=${appId}`,
    );

    const blockingStatuses = [
      RazorpaySubscriptionStatuses.ACTIVE,
      RazorpaySubscriptionStatuses.AUTHENTICATED,
    ];

    // Check active/authenticated — these always block
    const existingBlockingSubscription = await this.db
      .select({ id: schema.subscriptions.id, status: schema.subscriptions.status })
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, userId),
          eq(schema.subscriptions.appId, appId),
          inArray(schema.subscriptions.status, blockingStatuses),
        ),
      )
      .limit(1);

    if (existingBlockingSubscription.length > 0) {
      const blockingStatus = existingBlockingSubscription[0].status;
      this.logger.warn(
        `[createSubscriptionV2] ❌ Blocked — existing subscription in '${blockingStatus}' state | userId=${userId} appId=${appId}`,
      );
      throw new BadRequestException(
        blockingStatus === RazorpaySubscriptionStatuses.AUTHENTICATED
          ? 'A subscription mandate is already authenticated. Please wait for confirmation or contact support.'
          : 'User already has an active subscription',
      );
    }

    const razorpay = this.getRazorpayInstance(appId);

    // Fetch plan details from Razorpay
    this.logger.log(
      `[createSubscriptionV2] Fetching plan details for plan_id=${plan_id}`,
    );
    let planDetails: { item: { amount: number; currency: string } };
    try {
      planDetails = (await razorpay.plans.fetch(plan_id)) as {
        item: { amount: number; currency: string };
      };
      this.logger.log(
        `[createSubscriptionV2] ✅ Plan fetched | amount=${planDetails?.item?.amount} currency=${planDetails?.item?.currency}`,
      );
    } catch (error) {
      const err = error as { error?: { description?: string } };
      this.logger.error(
        `[createSubscriptionV2] ❌ Failed to fetch plan plan_id=${plan_id}`,
        err,
      );
      throw new BadRequestException(
        err?.error?.description || 'Invalid plan_id',
      );
    }

    const total_count = 100;

    // Find or create customer
    // fail_existing: '0' instructs Razorpay to return the existing customer instead of throwing
    this.logger.log(
      `[createSubscriptionV2] Creating/finding Razorpay customer for email=${email}`,
    );
    const customer = await (
      razorpay.customers.create as (
        params: RazorpayCreateCustomerParams,
      ) => Promise<RazorpayCustomer>
    )({
      name: email,
      email,
      contact,
      fail_existing: '0',
      notes,
    });
    const customerId = customer.id;
    this.logger.log(
      `[createSubscriptionV2] ✅ Customer ready | customerId=${customerId}`,
    );

    // Calculate start_at
    const nowSeconds = Math.floor(Date.now() / 1000);
    const defaultStartAt = nowSeconds + 60 * 60 * 24;
    let subscriptionStartAt = dto.start_at ?? defaultStartAt;
    if (subscriptionStartAt > 4765046400 * 1000) {
      subscriptionStartAt = Math.floor(subscriptionStartAt / 1000);
    }
    this.logger.log(
      `[createSubscriptionV2] start_at=${subscriptionStartAt} (raw dto.start_at=${dto.start_at ?? 'not provided'})`,
    );

    // Create subscription
    this.logger.log(
      `[createSubscriptionV2] Creating Razorpay subscription | plan_id=${plan_id} quantity=${quantity} total_count=${total_count} start_at=${subscriptionStartAt}`,
    );
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
      this.logger.log(
        `[createSubscriptionV2] ✅ Razorpay subscription created | razorpaySubscriptionId=${subscription.id}`,
      );
    } catch (error) {
      const err = error as { error?: { description?: string } };
      this.logger.error(
        `[createSubscriptionV2] ❌ Failed to create Razorpay subscription`,
        err,
      );
      throw new BadRequestException(
        err?.error?.description || 'Failed to create subscription',
      );
    }

    const subscriptionId = nanoid(8);
    this.logger.log(
      `[createSubscriptionV2] Inserting subscription into DB | internalId=${subscriptionId} razorpayId=${subscription.id}`,
    );

    try {
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
      this.logger.log(
        `[createSubscriptionV2] ✅ DB insert success | internalId=${subscriptionId}`,
      );
    } catch (error) {
      this.logger.error(
        `[createSubscriptionV2] ❌ DB insert failed | internalId=${subscriptionId} razorpayId=${subscription.id}`,
        error,
      );
      throw error;
    }

    const keyId = this.getKeyId(appId);
    const maxAmount = planDetails?.item?.amount ?? 19900;

    this.logger.log(
      `[createSubscriptionV2] ✅ DONE | internalId=${subscriptionId} razorpayId=${subscription.id} maxAmount=${maxAmount}`,
    );

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
          razorpayPaymentId: razorpay_payment_id,
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

  /**
   * Fetch live subscription status from Razorpay using subscriptions.fetch(id).
   *
   * Source of truth is always Razorpay — local DB may be stale if webhook
   * was missed. Automatically syncs local status if Razorpay differs.
   *
   * Client should call this after payment when the callback was not received,
   * instead of creating a new subscription.
   */
  async getSubscriptionStatus(
    appId: string,
    userId: string,
    razorpaySubscriptionId: string,
  ): Promise<{
    razorpaySubscriptionId: string;
    status: string;             // Live status from Razorpay
    localStatus: string | null; // Status in our DB before sync
    synced: boolean;            // true if we updated local DB to match Razorpay
    planId: string | null;
    paidCount: number;
    remainingCount: number | null;
    chargeAt: Date | null;      // Next billing date
    isActive: boolean;          // shorthand: status === 'active'
  }> {
    const razorpay = this.getRazorpayInstance(appId);

    this.logger.log(
      `[getSubscriptionStatus] Fetching | razorpaySubId=${razorpaySubscriptionId} userId=${userId} appId=${appId}`,
    );

    // --- 1. Fetch live status from Razorpay ---
    let razorpaySub: RazorpaySubscriptionEntity;
    try {
      razorpaySub = (await razorpay.subscriptions.fetch(
        razorpaySubscriptionId,
      )) as unknown as RazorpaySubscriptionEntity;
    } catch (error) {
      const err = error as { error?: { description?: string } };
      this.logger.error(
        `[getSubscriptionStatus] ❌ Razorpay fetch failed | subId=${razorpaySubscriptionId}`,
        err,
      );
      throw new BadRequestException(
        err?.error?.description ||
          `Subscription ${razorpaySubscriptionId} not found on Razorpay`,
      );
    }

    // --- 2. Look up local subscription row ---
    const localRows = await this.db
      .select({
        id: schema.subscriptions.id,
        status: schema.subscriptions.status,
        userId: schema.subscriptions.userId,
      })
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.razorpaySubscriptionId, razorpaySubscriptionId),
          eq(schema.subscriptions.userId, userId),
        ),
      )
      .limit(1);

    const localRow = localRows[0] ?? null;
    const localStatus = localRow?.status ?? null;

    // --- 3. Sync local DB if Razorpay status differs ---
    let synced = false;
    // razorpaySub.status is already typed as RazorpaySubscriptionStatus via the entity type
    const razorpayStatus: RazorpaySubscriptionStatus = razorpaySub.status;

    if (localRow && localRow.status !== razorpayStatus) {
      this.logger.log(
        `[getSubscriptionStatus] ⚠️ Status mismatch — local='${localRow.status}' razorpay='${razorpayStatus}' — syncing local DB`,
      );
      await this.db
        .update(schema.subscriptions)
        .set({
          status: razorpayStatus,
          ...(razorpaySub.charge_at && {
            chargeAt: new Date(razorpaySub.charge_at * 1000),
          }),
          paidCount: razorpaySub.paid_count,
          remainingCount: razorpaySub.remaining_count ?? undefined,
          updatedAt: new Date(),
        })
        .where(
          eq(
            schema.subscriptions.razorpaySubscriptionId,
            razorpaySubscriptionId,
          ),
        );
      synced = true;
    }

    this.logger.log(
      `[getSubscriptionStatus] ✅ Done | status=${razorpayStatus} synced=${synced}`,
    );

    return {
      razorpaySubscriptionId: razorpaySub.id,
      status: razorpayStatus,
      localStatus,
      synced,
      planId: razorpaySub.plan_id ?? null,
      paidCount: razorpaySub.paid_count,
      remainingCount: razorpaySub.remaining_count ?? null,
      chargeAt: razorpaySub.charge_at
        ? new Date(razorpaySub.charge_at * 1000)
        : null,
      isActive: razorpayStatus === RazorpaySubscriptionStatuses.ACTIVE,
    };
  }

  /**
   * Fetch live order status from Razorpay and reconcile with local DB.
   * Client should call this before creating a new order to detect an
   * already-paid (but callback-missed) order and avoid duplicate charges.
   */
  async getOrderStatus(
    appId: string,
    userId: string,
    razorpayOrderId: string,
  ): Promise<{
    razorpayOrderId: string;
    status: string;          // Razorpay live status: created | attempted | paid
    amount: number;          // in rupees
    currency: string;
    attempts: number;
    localStatus: string | null;    // status stored in our DB
    alreadyPaid: boolean;   // true when Razorpay says 'paid' — DO NOT re-charge
    localOrderId: string | null;   // internal order ID from our DB
  }> {
    const razorpay = this.getRazorpayInstance(appId);

    this.logger.log(
      `[getOrderStatus] Fetching order | razorpayOrderId=${razorpayOrderId} userId=${userId} appId=${appId}`,
    );

    // --- 1. Fetch live status from Razorpay ---
    let razorpayOrder: {
      id: string;
      status: RazorpayOrderStatus;
      amount: number;
      currency: string;
      attempts: number;
    };
    try {
      razorpayOrder = (await razorpay.orders.fetch(razorpayOrderId)) as typeof razorpayOrder;
    } catch (error) {
      const err = error as { error?: { description?: string } };
      this.logger.error(
        `[getOrderStatus] ❌ Failed to fetch order from Razorpay | orderId=${razorpayOrderId}`,
        err,
      );
      throw new BadRequestException(
        err?.error?.description || `Order ${razorpayOrderId} not found on Razorpay`,
      );
    }

    // --- 2. Look up our local order row ---
    const localOrders = await this.db
      .select({
        id: schema.orders.id,
        status: schema.orders.status,
        userId: schema.orders.userId,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.razorpayOrderId, razorpayOrderId),
          eq(schema.orders.userId, userId),
        ),
      )
      .limit(1);

    const localOrder = localOrders[0] ?? null;

    const alreadyPaid = razorpayOrder.status === RazorpayOrderStatuses.PAID;

    // --- 3. If Razorpay says paid but our local order is not captured, sync it ---
    // Use orderStatusEnum.enumValues (from DB schema) so this stays in sync
    // with the DB column definition — no magic strings.
    const CAPTURED = orderStatusEnum.enumValues[2]; // 'captured'
    if (alreadyPaid && localOrder && localOrder.status !== CAPTURED) {
      this.logger.log(
        `[getOrderStatus] ⚠️ Order ${razorpayOrderId} is paid on Razorpay but local status is '${localOrder.status}' — auto-syncing to ${CAPTURED}`,
      );
      await this.db
        .update(schema.orders)
        .set({ status: CAPTURED, updatedAt: new Date() })
        .where(eq(schema.orders.razorpayOrderId, razorpayOrderId));
    }

    this.logger.log(
      `[getOrderStatus] ✅ Done | razorpayStatus=${razorpayOrder.status} localStatus=${localOrder?.status ?? 'N/A'} alreadyPaid=${alreadyPaid}`,
    );

    return {
      razorpayOrderId: razorpayOrder.id,
      status: razorpayOrder.status,
      amount: razorpayOrder.amount / 100, // convert paise → rupees
      currency: razorpayOrder.currency,
      attempts: razorpayOrder.attempts,
      localStatus: localOrder?.status ?? null,
      alreadyPaid,
      localOrderId: localOrder?.id ?? null,
    };
  }
}
