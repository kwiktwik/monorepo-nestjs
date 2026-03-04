/**
 * Order Status Constants
 *
 * These constants match the orderStatusEnum defined in db/schema.ts
 * Use these constants instead of string literals to ensure type safety
 * and consistency across the codebase.
 */

export const ORDER_STATUS = {
  CREATED: "created",
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  FAILED: "failed",
  CANCELLED: "cancelled",
  ACTIVE: "active",
} as const;

// Type for order status
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Helper function to check if a string is a valid order status
export function isValidOrderStatus(status: string): status is OrderStatus {
  return Object.values(ORDER_STATUS).includes(status as OrderStatus);
}

// Helper function to get display name for status
export function getOrderStatusDisplayName(status: OrderStatus): string {
  const displayNames: Record<OrderStatus, string> = {
    [ORDER_STATUS.CREATED]: "Created",
    [ORDER_STATUS.AUTHORIZED]: "Authorized",
    [ORDER_STATUS.CAPTURED]: "Captured",
    [ORDER_STATUS.FAILED]: "Failed",
    [ORDER_STATUS.CANCELLED]: "Cancelled",
    [ORDER_STATUS.ACTIVE]: "Active",
  };
  return displayNames[status];
}

// Helper function to check if order is successful
export function isOrderSuccessful(status: OrderStatus): boolean {
  return status === ORDER_STATUS.CAPTURED || status === ORDER_STATUS.ACTIVE || status === ORDER_STATUS.AUTHORIZED;
}

// Helper function to check if order is pending
export function isOrderPending(status: OrderStatus): boolean {
  return status === ORDER_STATUS.CREATED || status === ORDER_STATUS.AUTHORIZED;
}

// Helper function to check if order is terminal (no further updates expected)
export function isOrderTerminal(status: OrderStatus): boolean {
  return (
    status === ORDER_STATUS.CAPTURED ||
    status === ORDER_STATUS.FAILED ||
    status === ORDER_STATUS.CANCELLED ||
    status === ORDER_STATUS.ACTIVE
  );
}
