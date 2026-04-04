/**
 * Phone number normalization utilities
 * Ensures consistency with +91 prefix format
 */

/**
 * Normalize phone number to +91 format
 * - Already has + prefix: keep as is
 * - Starts with 91: add + prefix
 * - No country code: add +91
 * - Removes leading zeros
 */
export function normalizePhoneNumber(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  const trimmed = String(phone).trim();
  if (!trimmed) return null;

  // Already has + prefix, keep as is
  if (trimmed.startsWith('+')) return trimmed;

  // Starts with 91 but missing +, add it
  if (trimmed.startsWith('91') && trimmed.length >= 10) {
    return '+' + trimmed;
  }

  // Remove leading zeros and add +91
  const cleaned = trimmed.replace(/^0+/, '');
  if (cleaned.length >= 10) {
    return '+91' + cleaned;
  }

  return trimmed;
}

/**
 * Normalize phone number for storage in migration logs
 * Returns empty string if null (for backward compatibility)
 */
export function normalizePhoneNumberForLog(
  phone: string | null | undefined,
): string {
  return normalizePhoneNumber(phone) || '';
}
