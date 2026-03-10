/**
 * Unified Login Types
 *
 * These types mirror the backend DTOs in kwiktwik-kirana-be/src/modules/auth/dto/login.dto.ts
 * and response types from auth-v1.controller.ts
 *
 * Supports three login providers:
 * - OTP: 6-digit code sent via SMS
 * - Truecaller: OAuth with Truecaller
 * - Google: OAuth with Google Sign-In
 */

/**
 * Login provider types
 */
export type LoginProvider = "otp" | "truecaller" | "google";

/**
 * Base login request with phone number
 * Phone number must be in E.164 format: + followed by country code and number
 */
export interface LoginBaseRequest {
  /** Phone number in E.164 format (e.g., +919876543210) */
  phoneNumber: string;
}

/**
 * OTP Login Request
 * Used for login with 6-digit OTP code sent via SMS
 */
export interface LoginOtpRequest extends LoginBaseRequest {
  /** 6-digit OTP code */
  code: string;
}

/**
 * Truecaller Login Request
 * Used for OAuth login with Truecaller
 */
export interface LoginTruecallerRequest extends LoginBaseRequest {
  /** Truecaller authorization code */
  code: string;
  /** PKCE code verifier */
  code_verifier: string;
  /** Truecaller OAuth client ID */
  client_id: string;
}

/**
 * Google Login Request
 * Used for OAuth login with Google Sign-In
 */
export interface LoginGoogleRequest extends LoginBaseRequest {
  /** Google ID token from Google Sign-In */
  idToken: string;
}

/**
 * Union type for all login requests
 */
export type LoginRequest =
  | LoginOtpRequest
  | LoginTruecallerRequest
  | LoginGoogleRequest;

/**
 * User data returned after successful login
 */
export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  image?: string;
}

/**
 * Alternate backend endpoints for kirana-fe users
 */
export interface AlternateEndpoints {
  sendOtp: string;
  verifyOtp: string;
  truecaller: string;
  google: string;
}

/**
 * Unified Login Response
 * This is the standard response format for all login methods
 */
export interface UnifiedLoginResponse {
  success: boolean;
  /** JWT token (present on successful login) */
  token?: string;
  /** User data (present on successful login) */
  user?: AuthUserResponse;
  /** Truecaller user profile (only for truecaller login) */
  userProfile?: Record<string, unknown>;
  /** Authentication provider used */
  authProvider?: string;
  /** Success/error message */
  message?: string;
  /** Error code - "USE_ALTERNATE_BACKEND" means user exists in kirana-fe */
  error?: "USE_ALTERNATE_BACKEND" | string;
  /** Rate limit retry after (in seconds) */
  retryAfter?: number;
  /** Alternate backend URL (for kirana-fe users) */
  alternateBackend?: string;
  /** Alternate backend endpoints (for kirana-fe users) */
  alternateEndpoints?: AlternateEndpoints;
}

/**
 * Send OTP Request
 */
export interface SendOtpRequest {
  /** Phone number in E.164 format (e.g., +919876543210) */
  phoneNumber: string;
  /** Optional app hash for Android SMS retriever */
  appHash?: string;
}

/**
 * Send OTP Response
 */
export interface SendOtpResponse {
  success: boolean;
  message: string;
  /** Error code - "USE_ALTERNATE_BACKEND" means user exists in kirana-fe */
  error?: "USE_ALTERNATE_BACKEND";
  /** Alternate backend URL (for kirana-fe users) */
  alternateBackend?: string;
  /** Alternate backend endpoints (for kirana-fe users) */
  alternateEndpoints?: AlternateEndpoints;
  /** Rate limit retry after (in seconds) */
  retryAfter?: number;
}
