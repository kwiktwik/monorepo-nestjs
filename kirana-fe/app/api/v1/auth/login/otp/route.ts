import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    LoginOtpRequest,
    UnifiedLoginResponse,
} from "@/lib/types/login";

/**
 * OTP Login API (v1) - Path Compatibility Route
 *
 * Matches the backend path: POST /api/v1/auth/login/otp
 */
export async function POST(req: NextRequest) {
    const requestId = nanoid(8);
    const startTime = Date.now();
    const provider = "otp";

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
                { success: false, error: error.message } as UnifiedLoginResponse,
                { status: validStatus }
            );
        }
        throw error;
    }

    try {
        const body = await req.json();
        const { phoneNumber, code } = body as LoginOtpRequest;

        // Validate required fields
        if (!phoneNumber) throw new Error("Phone number is required");
        if (!code) throw new Error("OTP code is required");

        // Validate phone number format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            throw new Error("Invalid phone number format. Use E.164 (+919876543210)");
        }

        // TEST MODE: Handle test phone number 9999999999 with OTP 123456
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const isTestNumber = cleanPhone === "9999999999" || cleanPhone === "919999999999";
        const isTestOTP = code === "123456";

        if (isTestNumber && isTestOTP) {
            // ... test mode logic (same as unified login)
            let currentUser = await findUserByPhoneAndApp(phoneNumber, appId);
            if (!currentUser) {
                let existingUser = await findUserByPhone(phoneNumber);
                if (!existingUser) {
                    const tempEmail = `${cleanPhone}@alertpay.local`;
                    existingUser = await findUserByEmail(tempEmail);
                }

                if (existingUser) {
                    currentUser = existingUser;
                    await db.update(user).set({ phoneNumber, phoneNumberVerified: true, updatedAt: new Date() }).where(eq(user.id, currentUser.id));
                    await updateUserMetadata(currentUser.id, appId);
                } else {
                    currentUser = await createUserWithApp({
                        name: `User ${cleanPhone.slice(-4)}`,
                        email: `${cleanPhone}@alertpay.local`,
                        emailVerified: false,
                        phoneNumber,
                        phoneNumberVerified: true,
                    }, appId);
                }
            }
            const sessionToken = await createSessionWithApp(currentUser.id, appId);
            return NextResponse.json({
                success: true,
                token: sessionToken,
                user: {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    phoneNumber,
                    phoneNumberVerified: true,
                },
                authProvider: "otp",
                message: "OTP verified successfully (test mode)",
            } as UnifiedLoginResponse);
        }

        // Better Auth verification
        const result = await auth.api.verifyPhoneNumber({
            body: { phoneNumber, code, disableSession: false },
            headers: req.headers,
        });

        if (!result.token) throw new Error("Token missing in verification response");

        // Update metadata for app
        await updateUserMetadata(result.user.id, appId);

        return NextResponse.json({
            success: true,
            token: result.token,
            user: {
                id: result.user.id,
                name: result.user.name || `User ${cleanPhone.slice(-4)}`,
                email: result.user.email,
                phoneNumber,
                phoneNumberVerified: true,
                image: result.user.image || undefined,
            },
            authProvider: "otp",
            message: "OTP verified successfully",
        } as UnifiedLoginResponse);

    } catch (error) {
        console.error(`[${requestId}] [OTP Login Compat] Error:`, error);
        const status = error instanceof Error && (error.message.includes("Expired") || error.message.includes("Invalid")) ? 401 : 500;
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        } as UnifiedLoginResponse, { status });
    }
}
