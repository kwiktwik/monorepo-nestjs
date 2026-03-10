import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import type { SendOtpRequest, SendOtpResponse } from "@/lib/types/login";

/**
 * Send OTP API (v1) - Path Compatibility Route
 *
 * This endpoint sends an OTP code to the specified phone number via SMS.
 * Matches the path structure used in the new backend: POST /api/v1/auth/send-otp
 *
 * Request Body:
 * - phoneNumber: Phone number in E.164 format (required, e.g., "+919876543210")
 * - appHash: Optional app hash for Android SMS retriever
 *
 * Response:
 * - 200: OTP sent successfully
 * - 400: Invalid phone number or missing parameter
 * - 429: Rate limit exceeded
 * - 500: Error sending OTP
 */
export async function POST(req: NextRequest) {
    try {
        const body: SendOtpRequest = await req.json();
        const { phoneNumber, appHash } = body;

        // Validate app ID from headers
        let appId: string;
        try {
            const { validateAppFeature } = await import("@/lib/utils/app-validator");
            appId = validateAppFeature(req, "otpLogin");
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
                    { success: false, error: error.message } as SendOtpResponse,
                    { status: validStatus }
                );
            }
            throw error;
        }

        // Validate phone number
        if (!phoneNumber) {
            return NextResponse.json(
                { success: false, error: "Phone number is required" } as SendOtpResponse,
                { status: 400 }
            );
        }

        // Validate phone number format (E.164 format)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
                } as SendOtpResponse,
                { status: 400 }
            );
        }

        // TEST MODE: Skip sending for test number
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const isTestNumber =
            cleanPhone === "9999999999" || cleanPhone === "919999999999";

        if (isTestNumber) {
            console.log(
                `[Send OTP v1 - Compat] Test mode - skipping SMS for test number ${phoneNumber}`
            );
            return NextResponse.json(
                {
                    success: true,
                    message: "OTP sent successfully (test mode - use 123456)",
                } as SendOtpResponse,
                { status: 200 }
            );
        }

        // Create headers object with appHash
        const headers = new Headers(req.headers);
        if (appHash) {
            headers.set("x-app-hash", appHash);
        }

        // Use Better Auth to send OTP
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
            } as SendOtpResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error("[Send OTP v1 - Compat] Error:", error);

        // Handle rate limit errors
        if (
            error instanceof Error &&
            (error.message.toLowerCase().includes("rate limit") ||
                error.message.toLowerCase().includes("too many"))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Rate limit exceeded. Please try again later.",
                    retryAfter: 3600, // 1 hour
                } as SendOtpResponse,
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : "Failed to send OTP",
            } as SendOtpResponse,
            { status: 500 }
        );
    }
}
