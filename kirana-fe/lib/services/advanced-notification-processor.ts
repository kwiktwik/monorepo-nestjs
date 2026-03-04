/**
 * Advanced Notification Processing Service
 * Server-side implementation of Android notification processing logic
 * Uses robust UPI parsing logic from upi-parser.ts
 */

import {
    TransactionType,
    getCleanAppName,
    isUpiPaymentNotification,
} from "@/lib/utils/notification-utils";
import { parseUPINotification } from "@/lib/utils/upi-parser";

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
 * Advanced Notification Processor Class
 * Handles notification processing using advanced parsing
 */
export class AdvancedNotificationProcessor {
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
        }

        // Similar cleanup for team notifications
        if (this.sentTeamNotifications.size > this.MAX_PROCESSED_NOTIFICATIONS) {
            const toKeep = Math.floor(this.MAX_PROCESSED_NOTIFICATIONS / 2);
            const entries = Array.from(this.sentTeamNotifications);
            this.sentTeamNotifications = new Set(entries.slice(-toKeep));
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
        // We still use the basic check effectively as a first pass filter
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

        // Parse payment details using advanced parser
        const parsed = parseUPINotification(
            packageName,
            title,
            bigText ? `${text} ${bigText}` : text
        );

        if (!parsed || !parsed.amount || !parsed.isValid) {
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
        const shouldAnnounce = true;
        const shouldNotifyTeam = shouldAnnounce;

        return {
            notificationLogId: null, // Will be set after DB insertion
            amount: parsed.amount.toString(),
            payerName: parsed.from,
            transactionType: TransactionType.RECEIVED,
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
let processorInstance: AdvancedNotificationProcessor | null = null;

/**
 * Get singleton advanced notification processor instance
 */
export function getAdvancedNotificationProcessor(): AdvancedNotificationProcessor {
    if (!processorInstance) {
        processorInstance = new AdvancedNotificationProcessor();
    }
    return processorInstance;
}
