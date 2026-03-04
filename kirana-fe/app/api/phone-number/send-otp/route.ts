import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
// Import sendOTPViaAPI for future use - function available in @/lib/utils/sms
// import { sendOTPViaAPI } from "@/lib/utils/sms";

/**
 * Send OTP to Phone Number
 *
 * This endpoint sends an OTP code to the specified phone number via SMS.
 * Uses Better Auth's phoneNumber plugin which handles OTP generation and sending.
 * The actual SMS sending is done via Equence API through the sendOTPViaAPI function
 * (configured in auth.ts), which directly calls the Equence API.
 *
 * Body Parameters:
 * - phoneNumber: Phone number in E.164 format (required, e.g., "+919876543210")
 *
 * Response:
 * - 200: OTP sent successfully
 * - 400: Invalid phone number or missing parameter
 * - 500: Error sending OTP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, appHash } = body;

    // Validate app ID from headers
    let appId: string;
    try {
      const { validateAppFeature } = await import("@/lib/utils/app-validator");
      appId = validateAppFeature(req, "otpLogin");
    } catch (error) {
      if (error instanceof Error && error.name === "AppValidationError") {
        return NextResponse.json(
          { error: error.message },
          { status: (error as any).statusCode || 401 }
        );
      }
      throw error;
    }


    // Validate phone number
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // return NextResponse.json(
    //   {
    //     success: true,
    //     message: "OTP sent successfully",
    //     data: {
    //       phoneNumber: phoneNumber,
    //     },
    //   },
    //   { status: 200 }
    // );
    // Use Better Auth's API to send OTP
    // Note: Better Auth handles OTP generation internally and calls sendOTP callback
    // The sendOTP callback in auth.ts uses sendOTPViaAPI which directly calls Equence API
    // The sendOTPViaAPI function is available in @/lib/utils/sms for direct use

    // Create headers object with appHash
    const headers = new Headers(req.headers);
    if (appHash) {
      headers.set("x-app-hash", appHash);
    }

    const data = await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: phoneNumber,
      },
      headers: headers,
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Send OTP] Error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error("[Send OTP] Stack:", error.stack);
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to send OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
