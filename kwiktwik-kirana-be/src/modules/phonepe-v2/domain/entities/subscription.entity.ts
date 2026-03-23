import {
  SubscriptionState,
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
  ProductType,
} from '../enums/subscription.enum';

/**
 * Domain entity representing a PhonePe Autopay Subscription
 * This is the aggregate root for subscription lifecycle
 */
export class Subscription {
  private constructor(
    public readonly id: string,
    public readonly merchantSubscriptionId: string,
    public readonly userId: string,
    public readonly appId: string,
    private _state: SubscriptionState,
    public readonly maxAmount: number, // in paise
    public readonly frequency: SubscriptionFrequency,
    public readonly authWorkflowType: AuthWorkflowType,
    public readonly amountType: AmountType,
    public readonly productType: ProductType,
    public readonly expireAt: Date | null,
    public readonly metadata: Record<string, unknown>,
    private _phonepeSubscriptionId: string | null,
    private _activatedAt: Date | null,
    private _cancelledAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public nextBillingDate: Date | null,
    public billingCycleCount: number,
  ) {}

  // Factory method to create new subscription
  static create(params: {
    id: string;
    merchantSubscriptionId: string;
    userId: string;
    appId: string;
    maxAmount: number;
    frequency: SubscriptionFrequency;
    authWorkflowType: AuthWorkflowType;
    amountType: AmountType;
    expireAt?: Date;
    metadata?: Record<string, unknown>;
    environment?: 'SANDBOX' | 'PRODUCTION';
  }): Subscription {
    return new Subscription(
      params.id,
      params.merchantSubscriptionId,
      params.userId,
      params.appId,
      'CREATED',
      params.maxAmount,
      params.frequency,
      params.authWorkflowType,
      params.amountType,
      'UPI_MANDATE',
      params.expireAt || null,
      {
        ...(params.metadata || {}),
        environment: params.environment || 'SANDBOX',
      },
      null,
      null,
      null,
      new Date(),
      new Date(),
      null, // nextBillingDate - will be set after activation
      0, // billingCycleCount
    );
  }

  // Getters
  get state(): SubscriptionState {
    return this._state;
  }

  get phonepeSubscriptionId(): string | null {
    return this._phonepeSubscriptionId;
  }

  get activatedAt(): Date | null {
    return this._activatedAt;
  }

  get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  // State transitions

  /**
   * Called when user starts mandate setup
   */
  markAsActivationInProgress(): void {
    this.assertStateTransition('CREATED', 'ACTIVATION_IN_PROGRESS');
    this._state = 'ACTIVATION_IN_PROGRESS';
    this.updatedAt = new Date();
  }

  /**
   * Called when mandate is successfully approved
   */
  activate(
    phonepeSubscriptionId: string,
    expireAt?: Date | number | null,
  ): void {
    this.assertStateTransition('ACTIVATION_IN_PROGRESS', 'ACTIVE');
    this._phonepeSubscriptionId = phonepeSubscriptionId;
    this._state = 'ACTIVE';
    this._activatedAt = new Date();
    (this as any).expireAt = expireAt
      ? expireAt instanceof Date
        ? expireAt
        : new Date(expireAt)
      : this.expireAt;
    this.updatedAt = new Date();
  }

  /**
   * Called when setup fails
   */
  markAsFailed(): void {
    if (!['CREATED', 'ACTIVATION_IN_PROGRESS'].includes(this._state)) {
      throw new Error(`Cannot mark as FAILED from state: ${this._state}`);
    }
    this._state = 'FAILED';
    this.updatedAt = new Date();
  }

  /**
   * Called when subscription is paused by user
   */
  pause(): void {
    this.assertStateTransition('ACTIVE', 'PAUSED');
    this._state = 'PAUSED';
    this.updatedAt = new Date();
  }

  /**
   * Called when subscription is unpaused by user
   */
  unpause(): void {
    this.assertStateTransition('PAUSED', 'ACTIVE');
    this._state = 'ACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * Called when merchant initiates cancellation
   */
  initiateCancellation(): void {
    this.assertStateTransition('ACTIVE', 'CANCEL_IN_PROGRESS');
    this._state = 'CANCEL_IN_PROGRESS';
    this.updatedAt = new Date();
  }

  /**
   * Called when cancellation is confirmed
   */
  confirmCancellation(): void {
    if (this._state !== 'CANCEL_IN_PROGRESS') {
      throw new Error(`Cannot confirm cancellation from state: ${this._state}`);
    }
    this._state = 'CANCELLED';
    this._cancelledAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Called when user revokes mandate
   */
  revoke(): void {
    this.assertStateTransition('ACTIVE', 'REVOKED');
    this._state = 'REVOKED';
    this._cancelledAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Called when subscription expires
   */
  expire(): void {
    if (this._state !== 'ACTIVE') {
      throw new Error(`Cannot expire from state: ${this._state}`);
    }
    this._state = 'EXPIRED';
    this.updatedAt = new Date();
  }

  /**
   * Check if subscription can be used for redemption
   */
  canRedeem(): boolean {
    return this._state === 'ACTIVE';
  }

  /**
   * Check if subscription is in a terminal state
   */
  isTerminal(): boolean {
    return ['CANCELLED', 'REVOKED', 'EXPIRED', 'FAILED'].includes(this._state);
  }

  private assertStateTransition(
    from: SubscriptionState,
    to: SubscriptionState,
  ): void {
    if (this._state !== from) {
      throw new Error(
        `Invalid state transition: ${this._state} → ${to}. Expected: ${from} → ${to}`,
      );
    }
  }

  /**
   * Reconstruct from persistence
   */
  static reconstruct(data: {
    id: string;
    merchantSubscriptionId: string;
    userId: string;
    appId: string;
    state: SubscriptionState;
    maxAmount: number;
    frequency: SubscriptionFrequency;
    authWorkflowType: AuthWorkflowType;
    amountType: AmountType;
    productType: ProductType;
    expireAt: Date | null;
    metadata: Record<string, unknown>;
    phonepeSubscriptionId: string | null;
    activatedAt: Date | null;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    nextBillingDate?: Date | null;
    billingCycleCount?: number;
  }): Subscription {
    return new Subscription(
      data.id,
      data.merchantSubscriptionId,
      data.userId,
      data.appId,
      data.state,
      data.maxAmount,
      data.frequency,
      data.authWorkflowType,
      data.amountType,
      data.productType,
      data.expireAt,
      data.metadata,
      data.phonepeSubscriptionId,
      data.activatedAt,
      data.cancelledAt,
      data.createdAt,
      data.updatedAt,
      data.nextBillingDate || null,
      data.billingCycleCount || 0,
    );
  }

  /**
   * Calculate next billing date based on frequency
   */
  calculateNextBillingDate(fromDate: Date = new Date()): Date {
    switch (this.frequency) {
      case 'DAILY':
        return new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
      case 'WEEKLY':
        return new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'FORTNIGHTLY':
        return new Date(fromDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      case 'MONTHLY':
      default:
        return new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'QUARTERLY':
        return new Date(fromDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      case 'HALFYEARLY':
        return new Date(fromDate.getTime() + 180 * 24 * 60 * 60 * 1000);
      case 'YEARLY':
        return new Date(fromDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Schedule next billing after successful redemption
   */
  scheduleNextBilling(): void {
    this.nextBillingDate = this.calculateNextBillingDate();
    this.billingCycleCount++;
    this.updatedAt = new Date();
  }
}
