import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tempTestNotifications } from "@/db/schema";
import { eq, and, asc, isNull } from "drizzle-orm";
import { auth } from "@/lib/better-auth/auth";

// Temporary API for E2E testing via polling
export async function POST(request: NextRequest) {
    try {
        console.log("[POLL_POST] Request received");
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Allow unauthenticated requests for now to make testing easier if needed,
        // but prefer authenticated.
        const userId = session?.user?.id;
        console.log("[POLL_POST] User ID from session:", userId);

        const body = await request.json();
        console.log("[POLL_POST] Body:", JSON.stringify(body));

        // Action: "create" (Frontend) or "ack" (Android)
        const action = body.action || "create";

        if (action === "create") {
            // Frontend creating a test notification
            const targetUserId = body.userId || userId;

            if (!targetUserId) {
                console.warn("[POLL_POST] Create failed: User ID required");
                return NextResponse.json({ error: "User ID required" }, { status: 400 });
            }

            const newEntry = await db.insert(tempTestNotifications).values({
                userId: targetUserId,
                payload: body.payload, // { packageName, title, content, ... }
                isProcessed: false
            }).returning();

            console.log("[POLL_POST] Created notification:", newEntry[0].id);

            return NextResponse.json({ success: true, id: newEntry[0].id });

        } else if (action === "ack") {
            // Android confirming receipt
            const notificationId = body.id;
            if (!notificationId) {
                return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
            }

            await db.update(tempTestNotifications)
                .set({ isProcessed: true })
                .where(eq(tempTestNotifications.id, notificationId));

            console.log("[POLL_POST] Acknowledged notification:", notificationId);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Poll API Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log("[POLL_GET] Request received");

        // Log headers for debugging auth
        // console.log("[POLL_GET] Headers:", Object.fromEntries(request.headers));

        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const userId = session?.user?.id;
        console.log("[POLL_GET] User ID from session:", userId);

        if (!userId) {
            console.warn("[POLL_GET] No user ID found in session. Headers Authorization:", request.headers.get('authorization'));
            return NextResponse.json({ error: "User ID required" }, { status: 401 });
        }

        // Fetch oldest unprocessed notification
        const pending = await db.select()
            .from(tempTestNotifications)
            .where(and(
                eq(tempTestNotifications.userId, userId),
                eq(tempTestNotifications.isProcessed, false)
            ))
            .orderBy(asc(tempTestNotifications.createdAt)) // FIFO
            .limit(1);

        console.log("[POLL_GET] Pending notifications found:", pending.length, pending.length > 0 ? pending[0].id : "none");

        if (pending.length === 0) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({
            found: true,
            notification: pending[0]
        });

    } catch (error) {
        console.error("Poll Fetch Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
