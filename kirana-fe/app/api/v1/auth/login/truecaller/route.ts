import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { updateUserMetadata } from "@/lib/utils/user-helpers";
import type {
  LoginTruecallerRequest,
  UnifiedLoginResponse,
} from "@/lib/types/login";

/**
 * Truecaller Login API (v1) - Path Compatibility Route
 *
 * Matches the backend path: POST /api/v1/auth/login/truecaller
 */
export async function POST(req: NextRequest) {
  const requestId = nanoid(8);
  const startTime = Date.now();

  // Validate app ID from headers
  let appId: string;
  try {
    const { validateAppFeature } = await import("@/lib/utils/app-validator");
    appId = validateAppFeature(req, "truecallerLogin");
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
    const { phoneNumber, code, code_verifier, client_id } =
      body as LoginTruecallerRequest;

    // Validate required fields (phoneNumber is optional for Truecaller)
    if (!code || !code_verifier || !client_id) {
      throw new Error(
        "Missing required fields: code, code_verifier, client_id",
      );
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

    // Update metadata for app
    await updateUserMetadata(data.user.id, appId);

    return NextResponse.json({
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
    } as UnifiedLoginResponse);
  } catch (error) {
    console.error(`[${requestId}] [Truecaller Login Compat] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error during Truecaller login",
      } as UnifiedLoginResponse,
      { status: 500 },
    );
  }
}
