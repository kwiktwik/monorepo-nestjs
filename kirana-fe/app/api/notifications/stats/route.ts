import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { getNotificationProcessor } from "@/lib/services/notification-processor";

/**
 * GET /api/notifications/stats
 * Get notification processing statistics
 */
export async function GET(request: NextRequest) {
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

        const processor = getNotificationProcessor();
        const stats = processor.getStats();

        return NextResponse.json(
            {
                success: true,
                stats: {
                    processedNotifications: stats.processedCount,
                    teamNotificationsSent: stats.teamNotificationCount,
                    lastCleanup: stats.lastCleanupTime,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET /api/notifications/stats] Error:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message || "Failed to get stats" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
