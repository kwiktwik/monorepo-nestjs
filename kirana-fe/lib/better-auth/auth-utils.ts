import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Auth Utility Functions
 */

const ADMIN_MOBILE_NUMBER = process.env.ADMIN_MOBILE_NUMBER;
const SEND_LEVEL_ADMIN_MOBILE_NUMBER = process.env.SEND_LEVEL_ADMIN_MOBILE_NUMBER;

/**
 * Checks if a phone number is in the allowed admin list.
 * Supports comma-separated list of numbers in ADMIN_MOBILE_NUMBER env var.
 */
export function isAllowedAdmin(phoneNumber: string | null | undefined): boolean {
  if (!phoneNumber || !ADMIN_MOBILE_NUMBER) return false;

  const allowedNumbers = ADMIN_MOBILE_NUMBER.split(",").map((n) => n.replace(/\D/g, ""));
  const requestedNumber = phoneNumber.replace(/\D/g, "");

  return allowedNumbers.includes(requestedNumber);
}

/**
 * Checks if a phone number is in the allowed SEND-level admin list.
 * Supports comma-separated list of numbers in SEND_LEVEL_ADMIN_MOBILE_NUMBER env var.
 */
export function isAllowedSendLevelAdmin(phoneNumber: string | null | undefined): boolean {
  if (!phoneNumber || !SEND_LEVEL_ADMIN_MOBILE_NUMBER) return false;

  const allowedNumbers = SEND_LEVEL_ADMIN_MOBILE_NUMBER.split(",").map((n) =>
    n.replace(/\D/g, ""),
  );
  const requestedNumber = phoneNumber.replace(/\D/g, "");

  return allowedNumbers.includes(requestedNumber);
}

/**
 * Subscription-admins are allowed to manage subscription state (expire/cancel/reset) but
 * are not necessarily full admins for other operations.
 */
export function isAllowedSubscriptionAdmin(phoneNumber: string | null | undefined): boolean {
  return isAllowedAdmin(phoneNumber) || isAllowedSendLevelAdmin(phoneNumber);
}

/**
 * Ensures the current requester is an authorized admin.
 * Throws an error or redirects if not authorized.
 * Useful for Server Actions and Server Components.
 */
export async function requireAdmin() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !isAllowedAdmin(session.user.phoneNumber)) {
    console.warn(
      `[requireAdmin] Unauthorized access attempt: ${session?.user.phoneNumber || "No Session"}`,
    );
    throw new Error("Unauthorized: Admin access required");
  }

  return session;
}

/**
 * Ensures the current requester is an authorized subscription-admin.
 * Useful for Server Actions that should be available to SEND-level admins.
 */
export async function requireSubscriptionAdmin() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !isAllowedSubscriptionAdmin(session.user.phoneNumber)) {
    console.warn(
      `[requireSubscriptionAdmin] Unauthorized access attempt: ${session?.user.phoneNumber || "No Session"}`,
    );
    throw new Error("Unauthorized: Subscription admin access required");
  }

  return session;
}
