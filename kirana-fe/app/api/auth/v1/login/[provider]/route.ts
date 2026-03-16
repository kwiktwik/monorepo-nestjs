import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { user, session } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  findUserByPhoneAndApp,
  findUserByPhone,
  findUserByEmail,
  createUserWithApp,
  updateUserMetadata,
  createSessionWithApp,
} from "@/lib/utils/user-helpers";
import type {
  LoginProvider,
  LoginOtpRequest,
  LoginTruecallerRequest,
  LoginGoogleRequest,
  UnifiedLoginResponse,
} from "@/lib/types/login";

/**
 * Unified Login API (v1)
 *
 * This endpoint provides a single entry point for all login methods:
 * - OTP: POST /api/auth/v1/login/otp
 * - Truecaller: POST /api/auth/v1/login/truecaller
 * - Google: POST /api/auth/v1/login/google
 *
 * Request body varies by provider:
 * - OTP: { phoneNumber: string, code: string }
 * - Truecaller: { phoneNumber: string, code: string, code_verifier: string, client_id: string }
 * - Google: { phoneNumber: string, idToken: string }
 *
 * Response:
 * - 200: Login successful, returns JWT token and user data
 * - 400: Invalid provider or missing required fields
 * - 401: Invalid credentials
 * - 500: Internal server error
 */

// Provider type validation
const VALID_PROVIDERS: LoginProvider[] = ["otp", "truecaller", "google"];

function isValidProvider(provider: string): provider is LoginProvider {
  return VALID_PROVIDERS.includes(provider as LoginProvider);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const requestId = nanoid(8);
  const startTime = Date.now();
  const { provider } = await params;

  console.log(`[${requestId}] [Unified Login] Request received`, {
    provider,
    timestamp: new Date().toISOString(),
    ip:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  });

  // Validate provider
  if (!isValidProvider(provider)) {
    console.log(`[${requestId}] [Unified Login] Invalid provider: ${provider}`);
    return NextResponse.json(
      {
        success: false,
        error: `Invalid provider: ${provider}. Must be one of: ${VALID_PROVIDERS.join(", ")}`,
      } as UnifiedLoginResponse,
      { status: 400 },
    );
  }

  // Validate app ID from headers
  let appId: string;
  try {
    const { validateAppFeature } = await import("@/lib/utils/app-validator");
    appId = validateAppFeature(
      req,
      provider === "otp"
        ? "otpLogin"
        : provider === "truecaller"
          ? "truecallerLogin"
          : "googleLogin",
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AppValidationError") {
      const potentialStatus = (error as any).statusCode || 401;
      const validStatus =
        typeof potentialStatus === "number" &&
        potentialStatus >= 200 &&
        potentialStatus <= 599
          ? potentialStatus
          : 401;
      return NextResponse.json(
        { success: false, error: error.message } as UnifiedLoginResponse,
        { status: validStatus },
      );
    }
    throw error;
  }

  try {
    const body = await req.json();
    console.log(`[${requestId}] [Unified Login] Processing ${provider} login`, {
      appId,
    });

    let response: UnifiedLoginResponse;

    switch (provider) {
      case "otp":
        response = await loginWithOtp(
          body as LoginOtpRequest,
          appId,
          requestId,
        );
        break;
      case "truecaller":
        response = await loginWithTruecaller(
          body as LoginTruecallerRequest,
          appId,
          requestId,
        );
        break;
      case "google":
        response = await loginWithGoogle(
          body as LoginGoogleRequest,
          appId,
          requestId,
        );
        break;
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[${requestId}] [Unified Login] Completed`, {
      provider,
      appId,
      success: response.success,
      hasToken: !!response.token,
      duration: `${totalDuration}ms`,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] [Unified Login] Error`, {
      provider,
      appId,
      error: error instanceof Error ? error.message : String(error),
      duration: `${totalDuration}ms`,
    });

    if (error instanceof Error) {
      // Check for authentication errors
      const errorMsg = error.message.toLowerCase();
      if (
        errorMsg.includes("invalid") ||
        errorMsg.includes("expired") ||
        errorMsg.includes("unauthorized")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Invalid credentials",
          } as UnifiedLoginResponse,
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error during login",
      } as UnifiedLoginResponse,
      { status: 500 },
    );
  }
}

/**
 * OTP Login Handler
 */
async function loginWithOtp(
  dto: LoginOtpRequest,
  appId: string,
  requestId: string,
): Promise<UnifiedLoginResponse> {
  const { phoneNumber, code } = dto;

  // Validate required fields
  if (!phoneNumber) {
    throw new Error("Phone number is required");
  }
  if (!code) {
    throw new Error("OTP code is required");
  }

  // Validate phone number format (E.164 format: + followed by country code and number)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new Error(
      "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
    );
  }

  // Validate OTP code format (typically 4-8 digits)
  const codeRegex = /^\d{4,8}$/;
  if (!codeRegex.test(code)) {
    throw new Error("Invalid OTP code format. OTP should be 4-8 digits");
  }

  // TEST MODE: Handle test phone number 9999999999 with OTP 123456
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const isTestNumber =
    cleanPhone === "9999999999" || cleanPhone === "919999999999";
  const isTestOTP = code === "123456";

  if (isTestNumber && isTestOTP) {
    console.log(
      `[${requestId}] [OTP Login] Test mode - bypassing verification`,
    );

    // Check if user already exists for this app
    let currentUser = await findUserByPhoneAndApp(phoneNumber, appId);

    if (!currentUser) {
      // Check if user exists globally
      let existingUser = await findUserByPhone(phoneNumber);

      if (!existingUser) {
        const tempEmail = `${cleanPhone}@kiranaapps.local`;
        existingUser = await findUserByEmail(tempEmail);
      }

      if (existingUser) {
        // Link existing user to this app
        currentUser = existingUser;
        await db
          .update(user)
          .set({
            phoneNumber: phoneNumber,
            phoneNumberVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(user.id, currentUser.id));
        await updateUserMetadata(currentUser.id, appId);
      } else {
        // Create new user
        const tempEmail = `${cleanPhone}@kiranaapps.local`;
        const tempName = `User ${cleanPhone.slice(-4)}`;

        currentUser = await createUserWithApp(
          {
            name: tempName,
            email: tempEmail,
            emailVerified: false,
            phoneNumber: phoneNumber,
            phoneNumberVerified: true,
          },
          appId,
        );
      }
    } else {
      // Update existing user
      await db
        .update(user)
        .set({
          phoneNumber: phoneNumber,
          phoneNumberVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, currentUser.id));
    }

    // Create session
    const sessionToken = await createSessionWithApp(currentUser.id, appId);

    return {
      success: true,
      token: sessionToken,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phoneNumber: phoneNumber,
        phoneNumberVerified: true,
        image: currentUser.image || undefined,
      },
      authProvider: "otp",
      message: "OTP verified successfully (test mode)",
    };
  }

  // Use Better Auth to verify phone number
  try {
    const result = await auth.api.verifyPhoneNumber({
      body: {
        phoneNumber: phoneNumber,
        code: code,
        disableSession: false,
      },
      headers: new Headers(),
    });

    if (!result.token) {
      throw new Error("Token missing in verification response");
    }

    return {
      success: true,
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name || `User ${cleanPhone.slice(-4)}`,
        email: result.user.email,
        phoneNumber: phoneNumber,
        phoneNumberVerified: true,
        image: result.user.image || undefined,
      },
      authProvider: "otp",
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error(`[${requestId}] [OTP Login] Better Auth error:`, error);
    throw new Error(
      error instanceof Error ? error.message : "Invalid or expired OTP",
    );
  }
}

/**
 * Truecaller Login Handler
 */
async function loginWithTruecaller(
  dto: LoginTruecallerRequest,
  appId: string,
  requestId: string,
): Promise<UnifiedLoginResponse> {
  const { phoneNumber, code, code_verifier, client_id } = dto;

  // Validate required fields (phoneNumber is optional for Truecaller)
  if (!code || !code_verifier || !client_id) {
    throw new Error("Missing required fields: code, code_verifier, client_id");
  }

  // Validate phone number format if provided
  if (phoneNumber) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error(
        "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
      );
    }
  }

  // Call existing Truecaller token endpoint logic
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const response = await fetch(`${baseURL}/api/truecaller/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-ID": appId,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id,
      code,
      code_verifier,
      ...(phoneNumber && { phoneNumber }), // Include phoneNumber only if provided
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Truecaller authentication failed");
  }

  const data = await response.json();

  if (!data.success || !data.token) {
    throw new Error(data.error || "Truecaller authentication failed");
  }

  return {
    success: true,
    token: data.token,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phoneNumber: data.user.phoneNumber,
      phoneNumberVerified: data.user.phoneNumberVerified || true,
      image: data.user.image,
    },
    userProfile: data.user_profile,
    authProvider: "truecaller",
    message: "Truecaller login successful",
  };
}

/**
 * Google Login Handler
 */
async function loginWithGoogle(
  dto: LoginGoogleRequest,
  appId: string,
  requestId: string,
): Promise<UnifiedLoginResponse> {
  const { phoneNumber, idToken } = dto;

  // Validate required fields
  if (!phoneNumber || !idToken) {
    throw new Error("Missing required fields: phoneNumber, idToken");
  }

  // Validate phone number format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new Error(
      "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
    );
  }

  // Call existing Google signin endpoint logic
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const response = await fetch(`${baseURL}/api/auth/google-signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-ID": appId,
    },
    body: JSON.stringify({
      idToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Google authentication failed");
  }

  // Get user info from the response or fetch it
  let userId = data.user?.id;
  let userName = data.user?.name;
  let userEmail = data.user?.email;
  let userImage = data.user?.image;

  if (!userId && data.token) {
    // Try to get user from session token
    const sessionData = await auth.api.getSession({
      headers: new Headers({
        authorization: `Bearer ${data.token}`,
      }),
    });

    if (sessionData?.user) {
      userId = sessionData.user.id;
      userName = sessionData.user.name;
      userEmail = sessionData.user.email;
      userImage = sessionData.user.image;
    }
  }

  if (!userId) {
    throw new Error("Failed to get user information from Google login");
  }

  // Update or create user metadata for this app
  await updateUserMetadata(userId, appId);

  return {
    success: true,
    token: data.token,
    user: {
      id: userId,
      name: userName || "Google User",
      email: userEmail,
      phoneNumber: phoneNumber,
      phoneNumberVerified: true,
      image: userImage,
    },
    authProvider: "google",
    message: "Google login successful",
  };
}
