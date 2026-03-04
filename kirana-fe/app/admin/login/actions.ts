"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { isAllowedSubscriptionAdmin } from "@/lib/better-auth/auth-utils";

export async function sendOtpAction(phoneNumber: string) {
    try {
        const reqHeaders = await headers();

        // Security: Only allow OTP for authorized admin numbers
        if (!isAllowedSubscriptionAdmin(phoneNumber)) {
            console.warn(`[sendOtpAction] Unauthorized phone number: ${phoneNumber}`);
            return { success: false, error: "Unauthorized access" };
        }

        // Directly invoke the Better Auth API server-side to send OTP.
        // This is more efficient than fetching the internal route.
        const result = await auth.api.sendPhoneNumberOTP({
            body: {
                phoneNumber,
            },
            headers: reqHeaders,
        });

        if (!result) {
            return { success: false, error: "Failed to send OTP" };
        }

        return { success: true };
    } catch (error) {
        console.error("Server Action: OTP request failed", error);
        const message = error instanceof Error ? error.message : "Failed to send OTP";
        return { success: false, error: message };
    }
}

export async function verifyOtpAction(phoneNumber: string, code: string) {
    try {
        const reqHeaders = await headers();

        // Security Check
        if (!isAllowedSubscriptionAdmin(phoneNumber)) {
            return { success: false, error: "Unauthorized" };
        }

        // Directly invoke the Better Auth API server-side.
        // Using asResponse: true ensures the nextCookies() plugin handles the response headers correctly.
        const response = await auth.api.verifyPhoneNumber({
            body: {
                phoneNumber,
                code,
            },
            headers: reqHeaders,
            asResponse: true,
        });

        if (!response.ok) {
            const result = await response.json();
            console.warn(`[verifyOtpAction] Verification failed`, result);
            return { success: false, error: result.error?.message || "Invalid OTP" };
        }

        // Return success instead of immediate redirect to allow smoother client-side navigation
        return { success: true };
    } catch (error) {
        console.error("Server Action: OTP verification failed", error);

        // Try to glean the error message if better-auth throws an API error format
        const errorObj = error as { error?: { message?: string } };
        const errorMessage =
          errorObj.error?.message ||
          (error instanceof Error ? error.message : "Invalid OTP");

        return { success: false, error: errorMessage };
    }
}
