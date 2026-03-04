import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { notificationLogs, enhancedNotifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PATCH /api/notifications/status
 *
 * Update TTS and other status fields from Android (or any client).
 * Uses the new tables: notification_logs and enhanced_notifications.
 *
 * Body:
 *   - notificationLogId (number, required): ID from POST /api/notifications response
 *   - ttsAnnounced (boolean, optional): whether TTS was announced on device
 *   - teamNotificationSent (boolean, optional): whether team notification was sent
 *
 * Updates:
 *   - notification_logs.tts_announced
 *   - enhanced_notifications.tts_announced, team_notification_sent, updated_at
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const notificationLogId = body.notificationLogId;
    if (notificationLogId == null || typeof notificationLogId !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid notificationLogId (number required)" },
        { status: 400 }
      );
    }

    const ttsAnnounced = body.ttsAnnounced;
    const teamNotificationSent = body.teamNotificationSent;

    if (ttsAnnounced === undefined && teamNotificationSent === undefined) {
      return NextResponse.json(
        { error: "Provide at least one field to update: ttsAnnounced, teamNotificationSent" },
        { status: 400 }
      );
    }

    // Resolve log and ensure it belongs to the user
    const [log] = await db
      .select()
      .from(notificationLogs)
      .where(
        and(
          eq(notificationLogs.id, notificationLogId),
          eq(notificationLogs.userId, userId)
        )
      )
      .limit(1);

    if (!log) {
      return NextResponse.json(
        { error: "Notification log not found or access denied" },
        { status: 404 }
      );
    }

    const updates: {
      notificationLog?: { ttsAnnounced?: boolean };
      enhanced?: { ttsAnnounced?: boolean; teamNotificationSent?: boolean };
    } = {};

    // Update notification_logs
    if (ttsAnnounced !== undefined) {
      await db
        .update(notificationLogs)
        .set({ ttsAnnounced: Boolean(ttsAnnounced) })
        .where(eq(notificationLogs.id, notificationLogId));
      updates.notificationLog = { ttsAnnounced: Boolean(ttsAnnounced) };
    }

    // Update enhanced_notifications by notification_log_id (and userId for safety)
    const enhancedWhere = and(
      eq(enhancedNotifications.notificationLogId, notificationLogId),
      eq(enhancedNotifications.userId, userId)
    );

    const enhancedSet: {
      ttsAnnounced?: boolean;
      teamNotificationSent?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };
    if (ttsAnnounced !== undefined) enhancedSet.ttsAnnounced = Boolean(ttsAnnounced);
    if (teamNotificationSent !== undefined) enhancedSet.teamNotificationSent = Boolean(teamNotificationSent);
    const hasEnhancedUpdates = enhancedSet.ttsAnnounced !== undefined || enhancedSet.teamNotificationSent !== undefined;
    if (hasEnhancedUpdates) {
      await db.update(enhancedNotifications).set(enhancedSet).where(enhancedWhere);
      updates.enhanced = {
        ...(ttsAnnounced !== undefined && { ttsAnnounced: Boolean(ttsAnnounced) }),
        ...(teamNotificationSent !== undefined && { teamNotificationSent: Boolean(teamNotificationSent) }),
      };
    }

    return NextResponse.json({
      success: true,
      notificationLogId,
      updated: updates,
    });
  } catch (error) {
    console.error("[PATCH /api/notifications/status] Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to update notification status" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
