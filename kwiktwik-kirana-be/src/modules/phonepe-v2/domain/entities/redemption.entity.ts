import { RedemptionState } from '../enums/subscription.enum';

/**
 * Domain entity representing a redemption (auto-debit) attempt
 * Tracks the lifecycle of a single charge notification → execution
 */
export class Redemption {
  private constructor(
    public readonly id: string,
    public readonly merchantOrderId: string,
    public readonly merchantSubscriptionId: string,
    public readonly userId: string,
    public readonly appId: string,
    public readonly amount: number, // in paise
    private _state: RedemptionState,
    private _phonepeOrderId: string | null,
    private _transactionId: string | null,
    private _notifiedAt: Date | null,
    private _expireAt: Date | null,
    private _errorCode: string | null,
    private _detailedErrorCode: string | null,
    public readonly autoDebit: boolean,
    public readonly metadata: Record<string, unknown>,
    public readonly createdAt: Date,
    public updatedAt: Date,
    // Tracking fields for monitoring and debugging
    public attemptCount: number,
    public processedAt: Date | null,
    public correlationId: string | null,
  ) {}

  // Factory method
  static create(params: {
    id: string;
    merchantOrderId: string;
    merchantSubscriptionId: string;
    userId: string;
    appId: string;
    amount: number;
    autoDebit?: boolean;
    metadata?: Record<string, unknown>;
  }): Redemption {
    return new Redemption(
      params.id,
      params.merchantOrderId,
      params.merchantSubscriptionId,
      params.userId,
      params.appId,
      params.amount,
      'NOTIFICATION_IN_PROGRESS',
      null,
      null,
      null,
      null,
      null,
      null,
      params.autoDebit ?? true, // Default to auto-debit
      params.metadata || {},
      new Date(),
      new Date(),
      1, // attemptCount
      null, // processedAt
      null, // correlationId
    );
  }

  // Getters
  get state(): RedemptionState {
    return this._state;
  }

  get phonepeOrderId(): string | null {
    return this._phonepeOrderId;
  }

  get transactionId(): string | null {
    return this._transactionId;
  }

  get notifiedAt(): Date | null {
    return this._notifiedAt;
  }

  get expireAt(): Date | null {
    return this._expireAt;
  }

  get errorCode(): string | null {
    return this._errorCode;
  }

  get detailedErrorCode(): string | null {
    return this._detailedErrorCode;
  }

  // State transitions

  /**
   * Called when notification is successfully sent to user
   * Uses expireAt from PhonePe API response
   */
  markAsNotified(phonepeOrderId: string, expireAt: Date): void {
    if (this._state !== 'NOTIFICATION_IN_PROGRESS') {
      throw new Error(`Cannot mark as notified from state: ${this._state}`);
    }
    this._phonepeOrderId = phonepeOrderId;
    this._state = 'NOTIFIED';
    this._notifiedAt = new Date();
    this._expireAt = expireAt;
    this.updatedAt = new Date();
  }

  /**
   * Called when notification fails
   */
  markNotificationFailed(errorCode: string, detailedErrorCode: string): void {
    if (this._state !== 'NOTIFICATION_IN_PROGRESS') {
      throw new Error(
        `Cannot mark notification as failed from state: ${this._state}`,
      );
    }
    this._state = 'FAILED';
    this._errorCode = errorCode;
    this._detailedErrorCode = detailedErrorCode;
    this.updatedAt = new Date();
  }

  /**
   * Called when auto-debit is in progress
   */
  markAsPending(): void {
    if (this._state !== 'NOTIFIED') {
      throw new Error(`Cannot mark as pending from state: ${this._state}`);
    }
    this._state = 'PENDING';
    this.updatedAt = new Date();
  }

  /**
   * Called when auto-debit succeeds
   */
  complete(transactionId: string): void {
    if (!['NOTIFIED', 'PENDING'].includes(this._state)) {
      throw new Error(`Cannot complete from state: ${this._state}`);
    }
    this._transactionId = transactionId;
    this._state = 'COMPLETED';
    this.updatedAt = new Date();
  }

  /**
   * Called when auto-debit fails
   */
  fail(errorCode: string, detailedErrorCode: string): void {
    if (!['NOTIFIED', 'PENDING'].includes(this._state)) {
      throw new Error(`Cannot fail from state: ${this._state}`);
    }
    this._state = 'FAILED';
    this._errorCode = errorCode;
    this._detailedErrorCode = detailedErrorCode;
    this.updatedAt = new Date();
  }

  /**
   * Check if redemption is in a terminal state
   */
  isTerminal(): boolean {
    return ['COMPLETED', 'FAILED'].includes(this._state);
  }

  /**
   * Check if redemption is still active/waiting
   */
  isActive(): boolean {
    return ['NOTIFICATION_IN_PROGRESS', 'NOTIFIED', 'PENDING'].includes(
      this._state,
    );
  }

  /**
   * Check if notification has expired (based on PhonePe's expireAt)
   */
  isExpired(): boolean {
    if (!this._expireAt) return false;
    return new Date() > this._expireAt;
  }

  /**
   * Reconstruct from persistence
   */
  static reconstruct(data: {
    id: string;
    merchantOrderId: string;
    merchantSubscriptionId: string;
    userId: string;
    appId: string;
    amount: number;
    state: RedemptionState;
    phonepeOrderId: string | null;
    transactionId: string | null;
    notifiedAt: Date | null;
    expireAt: Date | null;
    errorCode: string | null;
    detailedErrorCode: string | null;
    autoDebit: boolean;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    // Tracking fields
    attemptCount?: number;
    processedAt?: Date | null;
    correlationId?: string | null;
  }): Redemption {
    return new Redemption(
      data.id,
      data.merchantOrderId,
      data.merchantSubscriptionId,
      data.userId,
      data.appId,
      data.amount,
      data.state,
      data.phonepeOrderId,
      data.transactionId,
      data.notifiedAt,
      data.expireAt,
      data.errorCode,
      data.detailedErrorCode,
      data.autoDebit,
      data.metadata,
      data.createdAt,
      data.updatedAt,
      data.attemptCount ?? 1,
      data.processedAt ?? null,
      data.correlationId ?? null,
    );
  }
}
