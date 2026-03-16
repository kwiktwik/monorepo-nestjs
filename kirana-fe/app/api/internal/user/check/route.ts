import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone } from "@/lib/utils/user-helpers";

/**
 * Internal API: Check if user exists in kirana-fe
 * This endpoint is for internal service-to-service communication only
 * Protected by INTERNAL_API_KEY
 *
 * POST /api/internal/user/check
 * Headers:
 *   X-Internal-Key: <internal_api_key>
 *   Content-Type: application/json
 * Body:
 *   { phoneNumber: "+919876543210" }
 *
 * Response:
 *   { exists: true, userId: "...", phoneNumber: "..." }
 *   or
 *   { exists: false }
 */

// Get internal API key from environment
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check internal API key
    const internalKey = req.headers.get("x-internal-key");

    if (!INTERNAL_API_KEY || internalKey !== INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - invalid internal API key" },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phoneNumber is required" },
        { status: 400 },
      );
    }

    // Normalize phone number
    const digits = phoneNumber.replace(/\D/g, "");
    let normalizedPhone = phoneNumber;

    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      normalizedPhone = `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith("91")) {
      normalizedPhone = `+${digits}`;
    } else if (!phoneNumber.startsWith("+")) {
      normalizedPhone = `+${phoneNumber}`;
    }

    // Try to find user with normalized format (with +)
    console.log(
      `[Internal API] Checking user with normalized phone: ${normalizedPhone}`,
    );
    let user = await findUserByPhone(normalizedPhone);

    // If not found, try without + prefix (old DB format)
    if (!user && normalizedPhone.startsWith("+")) {
      const phoneWithoutPlus = normalizedPhone.substring(1);
      console.log(
        `[Internal API] User not found, trying without +: ${phoneWithoutPlus}`,
      );
      user = await findUserByPhone(phoneWithoutPlus);
    }

    if (user) {
      console.log(`[Internal API] User found: ${user.id}`);
      return NextResponse.json({
        exists: true,
        userId: user.id,
        phoneNumber: normalizedPhone,
        name: user.name,
        email: user.email,
      });
    }

    // User not found
    console.log(`[Internal API] User not found for: ${normalizedPhone}`);
    return NextResponse.json({
      exists: false,
      phoneNumber: normalizedPhone,
    });
  } catch (error) {
    console.error("[Internal API] Error checking user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
