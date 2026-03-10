import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { session, user } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Internal API: Validate Better-Auth session
 * This endpoint is for internal service-to-service communication
 * Protected by INTERNAL_API_KEY
 * POST /api/internal/session/validate
 * Headers:
 *   X-Internal-Key: <internal_api_key>
 * Body: { token: "session_token" }
 * Response: { userId, phoneNumber, email, name, expiresAt }
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
        { status: 401 }
      );
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Look up session in database
    const sessionRecord = await db
      .select({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        token: session.token,
      })
      .from(session)
      .where(
        and(
          eq(session.token, token),
          gt(session.expiresAt, new Date()) // Session not expired
        )
      )
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const sessionData = sessionRecord[0];

    // Get user details
    const userRecord = await db
      .select({
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, sessionData.userId))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userRecord[0];

    return NextResponse.json({
      userId: userData.id,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      name: userData.name,
      expiresAt: sessionData.expiresAt,
    });

  } catch (error) {
    console.error("[Internal API] Session validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
