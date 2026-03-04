"use server";

import { NotificationService } from "@/lib/services/notification-service";
import { requireAdmin } from "@/lib/better-auth/auth-utils";

export type SendNotificationParams = {
    userId?: string;
    token?: string;
    phoneNumber?: string;
    appId?: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    backend: "local" | "kwiktwik";
};

export async function sendNotificationAction(params: SendNotificationParams) {
    try {
        // Ensure admin access
        await requireAdmin();

        const { userId, token, phoneNumber, appId, title, body, data, backend } = params;

        if (backend === "local") {
            if ((!userId && !token) || !title || !body) {
                return { error: "Missing required fields (userId or token, title, body)" };
            }

            const notificationPayload = {
                title,
                body,
                data: data || {},
            };

            if (token) {
                const response = await NotificationService.sendToToken(token, notificationPayload);
                return { success: true, method: "token", messageId: response };
            } else if (userId && appId) {
                const response = await NotificationService.sendToUser(userId, appId, notificationPayload);
                return {
                    success: true,
                    method: "user",
                    userId,
                    appId,
                    successCount: response?.successCount,
                    failureCount: response?.failureCount,
                };
            } else {
                return { error: "If sending to userId, appId is required" };
            }
        } else if (backend === "kwiktwik") {
            // External backend: https://services.kiranaapps.com/
            // Endpoint: admin/notifications/send-test
            // Payload: { phoneNumber, payload: { title, body, ...data } }

            if (!phoneNumber || !title || !body) {
                return { error: "Missing required fields (phoneNumber, title, body) for KwikTwik backend" };
            }

            const externalUrl = "https://services.kiranaapps.com/admin/notifications/send-test";
            const response = await fetch(externalUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumber,
                    appId,
                    payload: {
                        title,
                        body,
                        ...(data || {}),
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    error: `External backend returned error: ${response.status}`,
                    details: errorData.message || errorData.error || response.statusText
                };
            }

            const result = await response.json();
            return { success: true, method: "kwiktwik", data: result };
        } else {
            return { error: "Invalid backend selection" };
        }
    } catch (error) {
        console.error("[sendNotificationAction] Error:", error);
        return {
            error: "Failed to send notification",
            details: error instanceof Error ? error.message : String(error),
        };
    }
}
