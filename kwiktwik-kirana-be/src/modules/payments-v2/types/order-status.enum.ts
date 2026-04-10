/**
 * Order Status Types
 * 
 * Order status for one-time payments and subscription charges.
 */

/**
 * Order status values
 */
export const OrderStatus = {
  /** Order created, awaiting payment */
  CREATED: 'CREATED',
  /** Payment initiated but not completed */
  PENDING: 'PENDING',
  /** Payment authorized but not captured */
  AUTHORIZED: 'AUTHORIZED',
  /** Payment captured successfully */
  CAPTURED: 'CAPTURED',
  /** Payment failed */
  FAILED: 'FAILED',
  /** Order cancelled */
  CANCELLED: 'CANCELLED',
  /** Payment refunded */
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

/**
 * All order statuses as a readonly array
 */
export const ALL_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.PENDING,
  OrderStatus.AUTHORIZED,
  OrderStatus.CAPTURED,
  OrderStatus.FAILED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const;

/**
 * Check if a value is a valid order status
 */
export function isOrderStatus(value: string): value is OrderStatus {
  return ALL_ORDER_STATUSES.includes(value as OrderStatus);
}

/**
 * Check if order is in a successful state
 */
export function isSuccessfulOrderStatus(status: OrderStatus): boolean {
  return status === OrderStatus.CAPTURED || status === OrderStatus.AUTHORIZED;
}

/**
 * Check if order is in a terminal state
 */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return (
    status === OrderStatus.CAPTURED ||
    status === OrderStatus.FAILED ||
    status === OrderStatus.CANCELLED ||
    status === OrderStatus.REFUNDED
  );
}

/**
 * Check if order status can be refunded
 */
export function canRefundOrderStatus(status: OrderStatus): boolean {
  return status === OrderStatus.CAPTURED || status === OrderStatus.AUTHORIZED;
}
