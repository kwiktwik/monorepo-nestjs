import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { teamNotifications, notificationLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNotificationProcessor } from "@/lib/services/notification-processor";
import { AnalyticsService } from "@/lib/services/analytics-service";

/**
 * POST /api/notifications/team-notify
 * Send notification to team members about received payment
 */
export async function POST(request: NextRequest) {
    try {
        // Get the Better Auth session
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized - no valid session" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const body = await request.json();

        // Validate required fields
        if (!body.notificationLogId || !body.amount || !body.appName) {
            return NextResponse.json(
                { error: "Missing required fields: notificationLogId, amount, appName" },
                { status: 400 }
            );
        }

        const { notificationLogId, amount, payerName, appName, teamMemberCount } = body;

        // Get notification processor for duplicate tracking
        const processor = getNotificationProcessor();
        const transactionKey = processor.generateTeamNotificationKey(
            notificationLogId,
            amount
        );

        // Check if already sent
        if (processor.isTeamNotificationSent(transactionKey)) {
            console.log(
                `[POST /api/notifications/team-notify] ⏭️ Skipping duplicate team notification: ${transactionKey}`
            );
            return NextResponse.json(
                {
                    success: false,
                    message: "Team notification already sent for this transaction",
                    transactionKey,
                },
                { status: 409 }
            );
        }

        // Verify notification log exists
        const notificationLog = await db
            .select()
            .from(notificationLogs)
            .where(eq(notificationLogs.id, notificationLogId))
            .limit(1);

        if (!notificationLog || notificationLog.length === 0) {
            return NextResponse.json(
                { error: "Notification log not found" },
                { status: 404 }
            );
        }

        try {
            // TODO: Integrate with Firebase Functions or your notification service
            // Example: await sendPushNotification(teamMembers, notificationData);

            // Simulate team notification sending
            const recipientCount = teamMemberCount || 0;

            // Create team notification record
            const teamNotification = await db
                .insert(teamNotifications)
                .values({
                    userId,
                    notificationLogId,
                    transactionKey,
                    recipientCount,
                    status: "SUCCESS",
                    errorMessage: null,
                })
                .returning();

            // Mark as sent to prevent duplicates
            processor.markTeamNotificationSent(transactionKey);

            // Log analytics
            AnalyticsService.logTeamNotificationEvent("sent", {
                amount,
                source: appName,
                members_count: recipientCount,
                notification_log_id: notificationLogId,
            });

            return NextResponse.json(
                {
                    success: true,
                    notificationsSent: recipientCount,
                    transactionKey,
                    teamNotificationId: teamNotification[0].id,
                    message: `Team notifications sent successfully to ${recipientCount} members`,
                },
                { status: 200 }
            );
        } catch (error) {
            // Log failure
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            await db.insert(teamNotifications).values({
                userId,
                notificationLogId,
                transactionKey,
                recipientCount: 0,
                status: "FAILED",
                errorMessage,
            });

            // Remove from sent tracking to allow retry
            processor.removeTeamNotificationTracking(transactionKey);

            // Log analytics
            AnalyticsService.logTeamNotificationEvent("failed", {
                amount,
                source: appName,
                error: errorMessage,
                notification_log_id: notificationLogId,
            });

            console.error(`❌ [Team Notification] Failed:`, error);

            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to send team notifications",
                    message: errorMessage,
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[POST /api/notifications/team-notify] Error:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message || "Failed to send team notification" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
