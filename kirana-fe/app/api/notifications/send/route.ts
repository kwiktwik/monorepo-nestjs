import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { NotificationService } from "@/lib/services/notification-service";

export async function POST(req: NextRequest) {
    try {
        console.log("[notifications/send] Incoming POST request");

        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            console.warn("[notifications/send] Unauthorized request - no session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[notifications/send] Authenticated user:", session.user.id);

        const { userId, token, appId, title, body, data } = await req.json();

        console.log("[notifications/send] Payload:", {
            userId,
            token: token ? `${token.substring(0, 10)}...` : undefined,
            appId,
            title,
            body: body?.substring(0, 50),
            hasData: !!data,
        });

        if ((!userId && !token) || !title || !body) {
            console.warn("[notifications/send] Missing required fields", { userId: !!userId, token: !!token, title: !!title, body: !!body });
            return NextResponse.json(
                { error: "Missing required fields (userId or token, title, body)" },
                { status: 400 }
            );
        }

        const notificationPayload = {
            title,
            body,
            data: data || {},
        };

        let result;

        if (token) {
            console.log("[notifications/send] Sending via token");
            const response = await NotificationService.sendToToken(token, notificationPayload);
            result = { success: true, method: "token", messageId: response };
            console.log("[notifications/send] Token send successful, messageId:", response);
        } else if (userId && appId) {
            console.log("[notifications/send] Sending to user:", userId, "app:", appId);
            const response = await NotificationService.sendToUser(userId, appId, notificationPayload);
            result = {
                success: true,
                method: "user",
                userId,
                appId,
                successCount: response?.successCount,
                failureCount: response?.failureCount,
            };
            console.log("[notifications/send] User send successful");
        } else {
            console.warn("[notifications/send] Missing appId for userId-based send");
            return NextResponse.json(
                { error: "If sending to userId, appId is required" },
                { status: 400 }
            );
        }

        console.log("[notifications/send] Response:", result);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[notifications/send] Error sending notification:", error);
        return NextResponse.json(
            {
                error: "Failed to send notification",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
