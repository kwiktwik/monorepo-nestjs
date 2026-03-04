/**
 * Notification Processing Service
 * Server-side implementation of Android notification processing logic
 */

import {
    TransactionType,
    parsePaymentDetails,
    getCleanAppName,
    isUpiPaymentNotification,
    normalizeText,
} from "@/lib/utils/notification-utils";

export interface NotificationLog {
    id?: number;
    userId: string;
    notificationId: string;
    packageName: string;
    appName: string;
    timestamp: number;
    title: string;
    text: string;
    bigText: string;
    hasTransaction: boolean;
    amount?: string | null;
    payerName?: string | null;
    transactionType?: TransactionType;
    processingTimeMs?: number;
    ttsAnnounced?: boolean;
    createdAt?: Date;
}

export interface ProcessedNotification {
    notificationLogId: number | null;
    amount: string | null;
    payerName: string | null;
    transactionType: TransactionType;
    shouldAnnounce: boolean;
    shouldNotifyTeam: boolean;
    processingTimeMs: number;
}

/**
 * Notification Processor Class
 * Handles notification processing, duplicate detection, and cleanup
 */
export class NotificationProcessor {
    private processedNotifications: Set<string> = new Set();
    private sentTeamNotifications: Set<string> = new Set();
    private lastCleanupTime: number = Date.now();
    private readonly CLEANUP_INTERVAL_MS = 3600000; // 1 hour
    private readonly MAX_PROCESSED_NOTIFICATIONS = 10000;

    /**
     * Check if notification has already been processed
     */
    isProcessed(notificationId: string): boolean {
        return this.processedNotifications.has(notificationId);
    }

    /**
     * Mark notification as processed
     */
    markAsProcessed(notificationId: string): void {
        this.processedNotifications.add(notificationId);
        this.cleanupIfNeeded();
    }

    /**
     * Check if team notification was already sent for this transaction
     */
    isTeamNotificationSent(transactionKey: string): boolean {
        return this.sentTeamNotifications.has(transactionKey);
    }

    /**
     * Mark team notification as sent
     */
    markTeamNotificationSent(transactionKey: string): void {
        this.sentTeamNotifications.add(transactionKey);
    }

    /**
     * Remove team notification tracking (for retry scenarios)
     */
    removeTeamNotificationTracking(transactionKey: string): void {
        this.sentTeamNotifications.delete(transactionKey);
    }

    /**
     * Cleanup old processed notifications periodically
     */
    private cleanupIfNeeded(): void {
        const now = Date.now();

        // Check if cleanup is needed
        if (now - this.lastCleanupTime < this.CLEANUP_INTERVAL_MS) {
            return;
        }

        // If we have too many processed notifications, clear half of them
        if (this.processedNotifications.size > this.MAX_PROCESSED_NOTIFICATIONS) {
            const toKeep = Math.floor(this.MAX_PROCESSED_NOTIFICATIONS / 2);
            const entries = Array.from(this.processedNotifications);
            this.processedNotifications = new Set(entries.slice(-toKeep));

            console.log(
                `[NotificationProcessor] Cleaned up old notifications. Kept ${toKeep} recent entries.`
            );
        }

        // Similar cleanup for team notifications
        if (this.sentTeamNotifications.size > this.MAX_PROCESSED_NOTIFICATIONS) {
            const toKeep = Math.floor(this.MAX_PROCESSED_NOTIFICATIONS / 2);
            const entries = Array.from(this.sentTeamNotifications);
            this.sentTeamNotifications = new Set(entries.slice(-toKeep));

            console.log(
                `[NotificationProcessor] Cleaned up old team notifications. Kept ${toKeep} recent entries.`
            );
        }

        this.lastCleanupTime = now;
    }

    /**
     * Validate if notification is a UPI payment notification
     */
    validateUpiNotification(
        packageName: string,
        title: string,
        text: string,
        bigText: string
    ): boolean {
        return isUpiPaymentNotification(packageName, title, text, bigText);
    }

    /**
     * Process notification and extract payment details
     */
    async processNotification(
        notificationId: string,
        packageName: string,
        title: string,
        text: string,
        bigText: string = ""
    ): Promise<ProcessedNotification> {
        const startTime = Date.now();

        // Check if already processed
        if (this.isProcessed(notificationId)) {
            console.log(
                `[NotificationProcessor] Skipping duplicate notification: ${notificationId}`
            );
            return {
                notificationLogId: null,
                amount: null,
                payerName: null,
                transactionType: TransactionType.UNKNOWN,
                shouldAnnounce: false,
                shouldNotifyTeam: false,
                processingTimeMs: Date.now() - startTime,
            };
        }

        // Validate UPI notification
        if (!this.validateUpiNotification(packageName, title, text, bigText)) {
            console.log(
                `[NotificationProcessor] Not a valid UPI payment notification: ${packageName}`
            );
            return {
                notificationLogId: null,
                amount: null,
                payerName: null,
                transactionType: TransactionType.UNKNOWN,
                shouldAnnounce: false,
                shouldNotifyTeam: false,
                processingTimeMs: Date.now() - startTime,
            };
        }

        // Parse payment details
        const paymentDetails = parsePaymentDetails(
            packageName,
            title,
            text,
            bigText
        );

        if (!paymentDetails || !paymentDetails.amount) {
            console.log(
                `[NotificationProcessor] Could not extract payment details from notification`
            );
            return {
                notificationLogId: null,
                amount: null,
                payerName: null,
                transactionType: TransactionType.UNKNOWN,
                shouldAnnounce: false,
                shouldNotifyTeam: false,
                processingTimeMs: Date.now() - startTime,
            };
        }

        // Mark as processed
        this.markAsProcessed(notificationId);

        const processingTimeMs = Date.now() - startTime;
        const shouldAnnounce =
            paymentDetails.transactionType === TransactionType.RECEIVED;
        const shouldNotifyTeam = shouldAnnounce;

        console.log(
            `[NotificationProcessor] Processed notification: amount=${paymentDetails.amount}, type=${paymentDetails.transactionType}, time=${processingTimeMs}ms`
        );

        return {
            notificationLogId: null, // Will be set after DB insertion
            amount: paymentDetails.amount,
            payerName: paymentDetails.payerName,
            transactionType: paymentDetails.transactionType,
            shouldAnnounce,
            shouldNotifyTeam,
            processingTimeMs,
        };
    }

    /**
     * Create notification log entry
     */
    createNotificationLog(
        userId: string,
        notificationId: string,
        packageName: string,
        timestamp: number,
        title: string,
        text: string,
        bigText: string,
        hasTransaction: boolean,
        amount?: string | null,
        payerName?: string | null,
        transactionType?: TransactionType,
        processingTimeMs?: number
    ): NotificationLog {
        return {
            userId,
            notificationId,
            packageName,
            appName: getCleanAppName(packageName),
            timestamp,
            title,
            text,
            bigText,
            hasTransaction,
            amount,
            payerName,
            transactionType,
            processingTimeMs,
            ttsAnnounced: false,
        };
    }

    /**
     * Generate team notification transaction key
     */
    generateTeamNotificationKey(
        notificationLogId: number,
        amount: string
    ): string {
        return `txn_${notificationLogId}_${amount}`;
    }

    /**
     * Get statistics about processed notifications
     */
    getStats(): {
        processedCount: number;
        teamNotificationCount: number;
        lastCleanupTime: Date;
    } {
        return {
            processedCount: this.processedNotifications.size,
            teamNotificationCount: this.sentTeamNotifications.size,
            lastCleanupTime: new Date(this.lastCleanupTime),
        };
    }

    /**
     * Clear all tracking (useful for testing)
     */
    clearAll(): void {
        this.processedNotifications.clear();
        this.sentTeamNotifications.clear();
        this.lastCleanupTime = Date.now();
    }
}

// Singleton instance
let processorInstance: NotificationProcessor | null = null;

/**
 * Get singleton notification processor instance
 */
export function getNotificationProcessor(): NotificationProcessor {
    if (!processorInstance) {
        processorInstance = new NotificationProcessor();
    }
    return processorInstance;
}
