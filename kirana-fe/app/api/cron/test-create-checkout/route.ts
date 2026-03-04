import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { abandonedCheckouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * Test endpoint to create abandoned checkout for testing purposes.
 * 
 * Authentication: Requires Authorization header with Bearer token matching CRON_SECRET
 * 
 * Body:
 * {
 *   userId: string,      // Required: User ID
 *   appId: string,       // Optional: App ID (default: alertpay-android)
 *   minutesAgo: number,  // Optional: How many minutes ago checkout started
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!CRON_SECRET || token !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, appId = "alertpay-android", minutesAgo = 0 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const checkoutStartedAt = new Date(Date.now() - minutesAgo * 60 * 1000);

    // Check if abandoned checkout already exists for this user/app
    const existing = await db
      .select()
      .from(abandonedCheckouts)
      .where(
        and(
          eq(abandonedCheckouts.userId, userId),
          eq(abandonedCheckouts.appId, appId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(abandonedCheckouts)
        .set({
          checkoutStartedAt,
          notificationsSent: 0,
          lastNotificationSentAt: null,
          nextNotificationScheduledAt: new Date(checkoutStartedAt.getTime() + 30 * 60 * 1000),
        })
        .where(eq(abandonedCheckouts.id, existing[0].id));

      console.log(`[TEST] Updated abandoned checkout for user ${userId}, checkout started ${minutesAgo} mins ago`);

      return NextResponse.json({
        success: true,
        message: `Updated abandoned checkout for user ${userId}`,
        checkoutStartedAt,
        minutesAgo,
      });
    } else {
      // Create new record
      await db.insert(abandonedCheckouts).values({
        userId,
        appId,
        checkoutStartedAt,
        notificationsSent: 0,
        nextNotificationScheduledAt: new Date(checkoutStartedAt.getTime() + 30 * 60 * 1000),
      });

      console.log(`[TEST] Created abandoned checkout for user ${userId}, checkout started ${minutesAgo} mins ago`);

      return NextResponse.json({
        success: true,
        message: `Created abandoned checkout for user ${userId}`,
        checkoutStartedAt,
        minutesAgo,
      });
    }
  } catch (error) {
    console.error("[TEST] Error creating abandoned checkout:", error);
    return NextResponse.json(
      { error: "Failed to create test abandoned checkout" },
      { status: 500 }
    );
  }
}
