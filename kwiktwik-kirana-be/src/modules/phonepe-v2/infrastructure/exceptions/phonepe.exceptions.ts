import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception for PhonePe API errors
 */
export class PhonePeException extends HttpException {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly statusCode: number,
    public readonly phonePeResponse?: string,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode,
        phonePeResponse,
      },
      statusCode,
    );
    this.name = 'PhonePeException';
  }
}

/**
 * Exception for subscription setup failures
 */
export class PhonePeSubscriptionSetupException extends PhonePeException {
  constructor(
    statusCode: number,
    phonePeResponse: string,
    message: string = 'Subscription setup failed',
  ) {
    super(message, 'SUBSCRIPTION_SETUP_FAILED', statusCode, phonePeResponse);
    this.name = 'PhonePeSubscriptionSetupException';
  }
}

/**
 * Exception for redemption notification failures
 */
export class PhonePeRedemptionNotificationException extends PhonePeException {
  constructor(
    statusCode: number,
    phonePeResponse: string,
    message: string = 'Redemption notification failed',
    errorCode: string = 'REDEMPTION_NOTIFICATION_FAILED',
  ) {
    super(message, errorCode, statusCode, phonePeResponse);
    this.name = 'PhonePeRedemptionNotificationException';
  }
}

/**
 * Exception for redemption execution failures
 */
export class PhonePeRedemptionExecutionException extends PhonePeException {
  constructor(
    statusCode: number,
    phonePeResponse: string,
    message: string = 'Redemption execution failed',
  ) {
    super(message, 'REDEMPTION_EXECUTION_FAILED', statusCode, phonePeResponse);
    this.name = 'PhonePeRedemptionExecutionException';
  }
}

/**
 * Exception for subscription status fetch failures
 */
export class PhonePeSubscriptionStatusException extends PhonePeException {
  constructor(
    statusCode: number,
    phonePeResponse: string,
    message: string = 'Failed to fetch subscription status',
  ) {
    super(message, 'SUBSCRIPTION_STATUS_FAILED', statusCode, phonePeResponse);
    this.name = 'PhonePeSubscriptionStatusException';
  }
}

/**
 * Exception for order status fetch failures
 */
export class PhonePeOrderStatusException extends PhonePeException {
  constructor(
    statusCode: number,
    phonePeResponse: string,
    message: string = 'Failed to fetch order status',
  ) {
    super(message, 'ORDER_STATUS_FAILED', statusCode, phonePeResponse);
    this.name = 'PhonePeOrderStatusException';
  }
}

/**
 * Exception for authentication failures
 */
export class PhonePeAuthException extends PhonePeException {
  constructor(
    phonePeResponse: string,
    message: string = 'PhonePe authentication failed',
  ) {
    super(
      message,
      'AUTHENTICATION_FAILED',
      HttpStatus.UNAUTHORIZED,
      phonePeResponse,
    );
    this.name = 'PhonePeAuthException';
  }
}

/**
 * Exception for timeout errors
 */
export class PhonePeTimeoutException extends PhonePeException {
  constructor(
    message: string = 'Request to PhonePe timed out',
    public readonly endpoint?: string,
  ) {
    super(message, 'REQUEST_TIMEOUT', HttpStatus.GATEWAY_TIMEOUT, undefined);
    this.name = 'PhonePeTimeoutException';
  }
}

/**
 * Exception for network/retry exhausted errors
 */
export class PhonePeRetryExhaustedException extends PhonePeException {
  constructor(
    public readonly attempts: number,
    public readonly lastError: Error,
    message: string = 'PhonePe request failed after maximum retry attempts',
  ) {
    super(
      message,
      'RETRY_EXHAUSTED',
      HttpStatus.SERVICE_UNAVAILABLE,
      lastError.message,
    );
    this.name = 'PhonePeRetryExhaustedException';
  }
}

/**
 * Exception for invalid configuration
 */
export class PhonePeConfigurationException extends PhonePeException {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'PhonePeConfigurationException';
  }
}
