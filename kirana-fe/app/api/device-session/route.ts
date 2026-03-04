import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { deviceSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Device session data from mobile apps
 */
interface DeviceSessionData {
  appId: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  platform?: string;
  manufacturer?: string;
  brand?: string;
  locale?: string;
  timezone?: string;
}

/**
 * POST /api/device-session
 * Stores device information for Facebook Conversions API
 * - Non-blocking: returns immediately
 * - Only creates new record when device info changes (major fields)
 * - Keeps history forever
 * 
 * Body: DeviceSessionData
 * Auth: Required (Bearer token)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: DeviceSessionData = await request.json();

    // Validate required fields
    if (!body.appId) {
      return NextResponse.json(
        { error: "appId is required" },
        { status: 400 }
      );
    }

    // Get the last device session for this user
    const lastSession = await db
      .select({
        deviceModel: deviceSessions.deviceModel,
        osVersion: deviceSessions.osVersion,
        appVersion: deviceSessions.appVersion,
      })
      .from(deviceSessions)
      .where(eq(deviceSessions.userId, session.user.id))
      .orderBy(desc(deviceSessions.createdAt))
      .limit(1);

    // Check if major fields changed
    const hasChanged =
      lastSession.length === 0 ||
      lastSession[0].deviceModel !== body.deviceModel ||
      lastSession[0].osVersion !== body.osVersion ||
      lastSession[0].appVersion !== body.appVersion;

    if (!hasChanged) {
      // No change, return 304 Not Modified
      return NextResponse.json(
        { success: true, message: "No change detected" },
        { status: 304 }
      );
    }

    // Insert new device session record
    await db.insert(deviceSessions).values({
      userId: session.user.id,
      appId: body.appId,
      deviceModel: body.deviceModel || null,
      osVersion: body.osVersion || null,
      appVersion: body.appVersion || null,
      platform: body.platform || null,
      manufacturer: body.manufacturer || null,
      brand: body.brand || null,
      locale: body.locale || null,
      timezone: body.timezone || null,
    });

    return NextResponse.json(
      { success: true, message: "Device session recorded" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Device Session API] Error:", error);
    // Return 202 even on error - don't block the app
    return NextResponse.json(
      { success: false, message: "Failed to record device session" },
      { status: 202 }
    );
  }
}
