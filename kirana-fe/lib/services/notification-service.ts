import { messaging } from "@/lib/firebase/server";
import { db } from "@/db";
import { pushTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class NotificationService {
    /**
     * Sends a push notification to a specific user for a specific app.
     */
    static async sendToUser(
        userId: string,
        appId: string,
        notification: { title: string; body: string; data?: Record<string, string> }
    ) {
        if (!messaging) {
            throw new Error("Firebase Messaging not initialized");
        }

        // Get all active tokens for this user and app
        const userTokens = await db
            .select({ token: pushTokens.token })
            .from(pushTokens)
            .where(
                and(
                    eq(pushTokens.userId, userId),
                    eq(pushTokens.appId, appId),
                    eq(pushTokens.isActive, true)
                )
            );

        if (userTokens.length === 0) {
            throw new Error(`No active push tokens found for user ${userId} and app ${appId}`);
        }

        const tokens = userTokens.map((t) => t.token);

        const response = await messaging.sendEachForMulticast({
            tokens,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data,
            android: {
                priority: "high",
                notification: {
                    channelId: "high_importance_channel",
                    priority: "high",
                },
            },
        });

        console.log(`Successfully sent ${response.successCount} messages to user ${userId}`);

        // Handle invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const code = resp.error?.code;
                    if (
                        code === "messaging/invalid-registration-token" ||
                        code === "messaging/registration-token-not-registered"
                    ) {
                        invalidTokens.push(tokens[idx]);
                    }
                }
            });

            if (invalidTokens.length > 0) {
                console.log(`Found ${invalidTokens.length} invalid tokens, marking as inactive`);
                for (const token of invalidTokens) {
                    await db
                        .update(pushTokens)
                        .set({ isActive: false, updatedAt: new Date() })
                        .where(eq(pushTokens.token, token));
                }
            }
        }

        return response;
    }

    /**
     * Sends a notification to a specific FCM token.
     */
    static async sendToToken(
        token: string,
        notification: { title: string; body: string; data?: Record<string, string> }
    ) {
        if (!messaging) {
            throw new Error("Firebase Messaging not initialized");
        }

        const response = await messaging.send({
            token,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data,
            android: {
                priority: "high",
                notification: {
                    channelId: "high_importance_channel",
                    priority: "high",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                },
            },
        });
        console.log("Successfully sent message to token:", response);
        return response;
    }
}
