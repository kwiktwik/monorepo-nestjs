/**
 * PhonePe Subscription Constants
 *
 * These constants match the enums defined in db/schema.ts
 * Use these constants instead of string literals to ensure type safety
 * and consistency across the codebase.
 */

export const PHONEPE_SUBSCRIPTION_STATE = {
  CREATED: "CREATED",
  AUTHENTICATED: "AUTHENTICATED",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const AMOUNT_TYPE = {
  FIXED: "FIXED",
  VARIABLE: "VARIABLE",
} as const;

export const FREQUENCY = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  ON_DEMAND: "ON_DEMAND",
} as const;

export const PHONEPE_ACTIONS = {
  CREATE_ORDER: "create-order",
  CREATE_ORDER_WITH_AUTH: "create-order-with-auth",
  CREATE_ORDER_TOKEN: "create-order-token",
  GET_AUTH_TOKEN: "get-auth-token",
  INITIATE_PAYMENT: "initiate-payment",
  SETUP_SUBSCRIPTION: "setup-subscription",
  CHECK_STATUS: "check-status",
  GET_SDK_CONFIG: "get-sdk-config",
} as const;

// Types
export type PhonePeSubscriptionState = typeof PHONEPE_SUBSCRIPTION_STATE[keyof typeof PHONEPE_SUBSCRIPTION_STATE];
export type AmountType = typeof AMOUNT_TYPE[keyof typeof AMOUNT_TYPE];
export type Frequency = typeof FREQUENCY[keyof typeof FREQUENCY];
export type PhonePeAction = typeof PHONEPE_ACTIONS[keyof typeof PHONEPE_ACTIONS];

// Helper functions
export function isValidPhonePeSubscriptionState(state: string): state is PhonePeSubscriptionState {
  return Object.values(PHONEPE_SUBSCRIPTION_STATE).includes(state as PhonePeSubscriptionState);
}

export function isValidAmountType(type: string): type is AmountType {
  return Object.values(AMOUNT_TYPE).includes(type as AmountType);
}

export function isValidFrequency(frequency: string): frequency is Frequency {
  return Object.values(FREQUENCY).includes(frequency as Frequency);
}

export function isValidPhonePeAction(action: string): action is PhonePeAction {
  return Object.values(PHONEPE_ACTIONS).includes(action as PhonePeAction);
}

// Display name helpers
export function getPhonePeSubscriptionStateDisplayName(state: PhonePeSubscriptionState): string {
  const displayNames: Record<PhonePeSubscriptionState, string> = {
    [PHONEPE_SUBSCRIPTION_STATE.CREATED]: "Created",
    [PHONEPE_SUBSCRIPTION_STATE.AUTHENTICATED]: "Authenticated",
    [PHONEPE_SUBSCRIPTION_STATE.ACTIVE]: "Active",
    [PHONEPE_SUBSCRIPTION_STATE.PAUSED]: "Paused",
    [PHONEPE_SUBSCRIPTION_STATE.CANCELLED]: "Cancelled",
    [PHONEPE_SUBSCRIPTION_STATE.COMPLETED]: "Completed",
    [PHONEPE_SUBSCRIPTION_STATE.FAILED]: "Failed",
  };
  return displayNames[state];
}

export function getAmountTypeDisplayName(type: AmountType): string {
  const displayNames: Record<AmountType, string> = {
    [AMOUNT_TYPE.FIXED]: "Fixed",
    [AMOUNT_TYPE.VARIABLE]: "Variable",
  };
  return displayNames[type];
}

export function getFrequencyDisplayName(frequency: Frequency): string {
  const displayNames: Record<Frequency, string> = {
    [FREQUENCY.DAILY]: "Daily",
    [FREQUENCY.WEEKLY]: "Weekly",
    [FREQUENCY.MONTHLY]: "Monthly",
    [FREQUENCY.ON_DEMAND]: "On Demand",
  };
  return displayNames[frequency];
}

// Status check helpers
export function isActiveSubscriptionState(state: PhonePeSubscriptionState): boolean {
  return state === PHONEPE_SUBSCRIPTION_STATE.ACTIVE || state === PHONEPE_SUBSCRIPTION_STATE.AUTHENTICATED;
}

export function isTerminalSubscriptionState(state: PhonePeSubscriptionState): boolean {
  return state === PHONEPE_SUBSCRIPTION_STATE.CANCELLED ||
    state === PHONEPE_SUBSCRIPTION_STATE.COMPLETED ||
    state === PHONEPE_SUBSCRIPTION_STATE.FAILED;
}

export function isPendingSubscriptionState(state: PhonePeSubscriptionState): boolean {
  return state === PHONEPE_SUBSCRIPTION_STATE.CREATED || state === PHONEPE_SUBSCRIPTION_STATE.PAUSED;
}