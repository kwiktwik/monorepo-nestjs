/**
 * Analytics Service
 * Tracks events across multiple analytics platforms
 */

export interface AnalyticsEvent {
    name: string;
    params?: Record<string, string | number | boolean>;
}

import { sendMixpanelEvent } from "@/lib/events/server";

export class AnalyticsService {
    /**
     * Safely execute an analytics operation without throwing
     */
    private static async safeExecute(operation: () => Promise<void>, context: string): Promise<void> {
        try {
            await operation();
        } catch (error) {
            console.error(`❌ [Analytics] Error in ${context} (suppressed):`, error);
        }
    }

    /**
     * Log event to console (can be extended to Firebase, Singular, CleverTap)
     */
    static async logEvent(eventName: string, params?: Record<string, string | number | boolean>, userId?: string): Promise<void> {
        await this.safeExecute(async () => {
            // Send to Mixpanel using the server-side utility
            // Use a default distinct_id if not provided
            const distinctId = userId || "anonymous";
            await sendMixpanelEvent(eventName, distinctId, params);
        }, `logEvent:${eventName}`);
    }

    /**
     * Log error events to Mixpanel
     */
    static async logError(error: unknown, context: string, metadata?: Record<string, any>): Promise<void> {
        await this.safeExecute(async () => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;

            console.error(`❌ [Analytics] Error in ${context}:`, errorMessage);

            await this.logEvent("server_error", {
                context,
                error_message: errorMessage,
                error_stack: errorStack || "No stack trace",
                ...metadata
            }, metadata?.userId);
        }, `logError:${context}`);
    }

    /**
     * Log notification-related events
     */
    static logNotificationEvent(
        eventType: 'created' | 'parsed' | 'detected' | 'failed',
        params: Record<string, string | number | boolean>
    ): void {
        // execute async without awaiting to not block main thread, but catch errors
        this.safeExecute(async () => {
            const eventMap = {
                created: 'notification_log_created',
                parsed: 'notification_parsing_success',
                detected: 'transaction_detected',
                failed: 'notification_parsing_failed',
            };

            // Extract userId if present in params to use as distinct_id
            const userId = params.userId as string | undefined;
            await this.logEvent(eventMap[eventType], params, userId);
        }, `logNotificationEvent:${eventType}`);
    }

    /**
     * Log team notification events
     */
    static logTeamNotificationEvent(
        eventType: 'sent' | 'failed',
        params: Record<string, string | number | boolean>
    ): void {
        // execute async without awaiting to not block main thread, but catch errors
        this.safeExecute(async () => {
            const eventMap = {
                sent: 'team_notification_sent',
                failed: 'team_notification_failed',
            };

            // Extract userId if present
            const userId = params.userId as string | undefined;
            await this.logEvent(eventMap[eventType], params, userId);
        }, `logTeamNotificationEvent:${eventType}`);
    }
}
