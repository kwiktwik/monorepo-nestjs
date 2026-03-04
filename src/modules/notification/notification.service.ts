import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc, and, like, gte, lte, sql } from 'drizzle-orm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  RegisterPushTokenDto,
  DeletePushTokenDto,
} from './dto/register-push-token.dto';
import { parseUPINotification } from '../../common/utils/upi-parser';
import * as admin from 'firebase-admin';

const logger = new Logger('NotificationService');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    logger.log('Firebase Admin initialized automatically');
  } catch (error) {
    logger.warn('Failed to initialize Firebase Admin automatically', error);
  }
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      transactionType?: string;
      packageName?: string;
      appName?: string;
    } = {},
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.enhancedNotifications.userId, userId)];

    if (options.startDate) {
      const start = new Date(options.startDate);
      if (!isNaN(start.getTime())) {
        conditions.push(gte(schema.enhancedNotifications.timestamp, start));
      }
    }

    if (options.endDate) {
      const end = new Date(options.endDate);
      if (!isNaN(end.getTime())) {
        conditions.push(lte(schema.enhancedNotifications.timestamp, end));
      }
    }

    if (
      options.transactionType &&
      ['RECEIVED', 'SENT', 'UNKNOWN'].includes(options.transactionType)
    ) {
      conditions.push(
        eq(
          schema.enhancedNotifications.transactionType,
          options.transactionType as 'RECEIVED' | 'SENT' | 'UNKNOWN',
        ),
      );
    }

    if (options.packageName) {
      conditions.push(
        eq(schema.enhancedNotifications.packageName, options.packageName),
      );
    }

    if (options.appName) {
      conditions.push(
        like(schema.enhancedNotifications.appName, `%${options.appName}%`),
      );
    }

    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.enhancedNotifications)
        .where(whereClause)
        .orderBy(desc(schema.enhancedNotifications.timestamp))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.enhancedNotifications)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    const toIST = (date: Date | null | undefined) => {
      if (!date) return date;
      const istTimeMs = date.getTime() + 5.5 * 60 * 60 * 1000;
      return new Date(istTimeMs).toISOString().replace('Z', '+05:30');
    };

    const formattedRows = rows.map((row) => ({
      ...row,
      timestamp: toIST(row.timestamp) as unknown as Date,
      createdAt: toIST(row.createdAt) as unknown as Date,
      updatedAt: toIST(row.updatedAt) as unknown as Date,
    }));

    return {
      data: formattedRows,
      pagination: { page, limit, total, totalPages },
    };
  }

  async create(userId: string, dto: CreateNotificationDto) {
    const packageName = dto.package_name || dto.packageName;
    if (!packageName) {
      throw new NotFoundException('Missing package_name');
    }

    const notificationId =
      dto.notification_id ||
      dto.notificationId ||
      `${packageName}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const timestamp = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const title = dto.title || '';
    const content = dto.content || dto.text || '';
    const bigText = dto.big_text || dto.bigText || '';
    const appName =
      dto.app_name || dto.appName || this.getCleanAppName(packageName);

    const existing = await this.db
      .select({ id: schema.enhancedNotifications.id })
      .from(schema.enhancedNotifications)
      .where(eq(schema.enhancedNotifications.notificationId, notificationId))
      .limit(1);

    if (existing.length > 0) {
      // kirana-fe shape: { data: [...], processed: N }
      return {
        data: [
          {
            status: 'duplicate',
            notificationId,
            message: 'Notification already processed',
          },
        ],
        processed: 1,
      };
    }

    const providedHasTransaction = dto.has_transaction ?? dto.hasTransaction;
    const providedAmount = dto.amount ? String(dto.amount) : null;
    const providedPayerName = dto.payer_name || dto.payerName;
    const providedTransactionType = dto.transaction_type || dto.transactionType;

    // kirana-fe v1: use client-provided details, or server-side UPI parsing (enhanced notification)
    let paymentAmount: string | null = providedAmount;
    let paymentPayerName: string | null = providedPayerName ?? null;
    let paymentTransactionType: 'RECEIVED' | 'SENT' | 'UNKNOWN' =
      (providedTransactionType as 'RECEIVED' | 'SENT' | 'UNKNOWN') || 'UNKNOWN';

    if (!paymentAmount && !providedHasTransaction) {
      const combinedText = bigText ? `${content} ${bigText}` : content;
      const parsed = parseUPINotification(packageName, title, combinedText);
      if (parsed?.isValid && parsed.amount > 0) {
        paymentAmount = String(parsed.amount);
        paymentPayerName = parsed.from ?? null;
        paymentTransactionType = 'RECEIVED';
      }
    }

    const transactionType = paymentTransactionType;
    const hasTransaction =
      Boolean(paymentAmount) || providedHasTransaction === true;

    const processingTimeMs = dto.processing_time_ms ?? 0;

    let notificationLogId: number | null = null;

    const logEntry = await this.db
      .insert(schema.notificationLogs)
      .values({
        userId,
        notificationId,
        packageName,
        appName,
        timestamp,
        title,
        text: content,
        bigText,
        hasTransaction,
        amount: paymentAmount,
        payerName: paymentPayerName,
        transactionType,
        processingTimeMs,
        ttsAnnounced: dto.tts_announced ?? dto.ttsAnnounced ?? false,
      })
      .returning();

    notificationLogId = logEntry[0]?.id ?? null;

    let enhancedNotificationId: number | null = null;

    if (hasTransaction && notificationLogId !== null && paymentAmount) {
      const enhancedRows = await this.db
        .insert(schema.enhancedNotifications)
        .values({
          userId,
          notificationId,
          originalNotificationId: null,
          packageName,
          appName,
          title,
          content,
          bigText,
          timestamp,
          hasTransaction: true,
          amount: paymentAmount,
          payerName: paymentPayerName,
          transactionType,
          processingTimeMs,
          processingMetadata: dto.processing_metadata ?? {},
          notificationLogId,
          ttsAnnounced: dto.tts_announced ?? dto.ttsAnnounced ?? false,
          teamNotificationSent:
            dto.team_notification_sent ?? dto.teamNotificationSent ?? false,
        })
        .returning();
      enhancedNotificationId = enhancedRows[0]?.id ?? null;
    }

    const createdAt = new Date();
    const updatedAt = new Date();
    const readNotification = this.generateTTSMessage(
      paymentAmount ?? null,
      paymentPayerName ?? null,
      hasTransaction,
    );

    // kirana-fe shape: { data: [ item ], processed: 1 } so Flutter can use response.data[0]
    const toIST = (date: Date | null | undefined) => {
      if (!date) return date;
      const istTimeMs = date.getTime() + 5.5 * 60 * 60 * 1000;
      return new Date(istTimeMs).toISOString().replace('Z', '+05:30');
    };

    const resultItem = {
      id: enhancedNotificationId ?? notificationLogId,
      notificationId,
      notificationLogId,
      packageName,
      appName,
      title,
      content,
      bigText: bigText,
      timestamp: toIST(timestamp) as unknown as Date,
      hasTransaction,
      amount: paymentAmount,
      payerName: paymentPayerName,
      transactionType,
      processingTimeMs,
      ttsAnnounced: dto.tts_announced ?? dto.ttsAnnounced ?? false,
      teamNotificationSent:
        dto.team_notification_sent ?? dto.teamNotificationSent ?? false,
      createdAt: toIST(createdAt) as unknown as Date,
      updatedAt: toIST(updatedAt) as unknown as Date,
      readNotification,
      status: 'success',
    };

    return {
      data: [resultItem],
      processed: 1,
    };
  }

  /**
   * Generate TTS message for notification (matches kirana-fe generateTTSMessage).
   */
  private generateTTSMessage(
    amount: string | null,
    payerName: string | null,
    hasTransaction: boolean,
  ): string {
    if (!hasTransaction) return '';
    const numAmount = amount != null ? parseFloat(amount) : NaN;
    if (Number.isFinite(numAmount) && numAmount > 0) {
      const formattedAmount = numAmount.toLocaleString('en-IN');
      const fromName = payerName || 'Unknown';
      return `₹${formattedAmount} received from ${fromName}`;
    }
    return '';
  }

  private getCleanAppName(packageName: string): string {
    const nameMap: Record<string, string> = {
      'com.upi.accentor': 'UPI',
      'com.phonepe.app': 'PhonePe',
      'com.google.android.apps.nbu.paisa': 'Google Pay',
      'net.one97.paytm': 'Paytm',
      'in.org.npci.upiapp': 'BHIM',
      'com.sbi.loans': 'SBI',
      'com.axis.mobile': 'Axis Bank',
      'com.icici.imobile': 'ICICI',
      'com.hdfcbk.nd': 'HDFC',
      'com.kotak.bank': 'Kotak',
      'com.pnb': 'PNB',
      'com.bankofbaroda': 'BoB',
      'com.canarabank': 'Canara',
    };
    return nameMap[packageName] || packageName.split('.').pop() || packageName;
  }

  async createTestNotification(userId: string, payload?: Record<string, any>) {
    const newEntry = await this.db
      .insert(schema.tempTestNotifications)
      .values({
        userId,
        payload: payload || {},
        isProcessed: false,
      })
      .returning();

    return { success: true, id: newEntry[0].id };
  }

  async pollTestNotification(userId: string) {
    const pending = await this.db
      .select()
      .from(schema.tempTestNotifications)
      .where(
        and(
          eq(schema.tempTestNotifications.userId, userId),
          eq(schema.tempTestNotifications.isProcessed, false),
        ),
      )
      .orderBy(schema.tempTestNotifications.createdAt)
      .limit(1);

    if (pending.length === 0) {
      return { found: false };
    }

    return {
      found: true,
      notification: pending[0],
    };
  }

  async ackTestNotification(notificationId: number) {
    await this.db
      .update(schema.tempTestNotifications)
      .set({ isProcessed: true, updatedAt: new Date() })
      .where(eq(schema.tempTestNotifications.id, notificationId));

    return { success: true };
  }

  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    await this.db
      .insert(schema.pushTokens)
      .values({
        userId,
        appId: dto.appId,
        token: dto.token,
        deviceModel: dto.deviceModel,
        osVersion: dto.osVersion,
        isActive: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.pushTokens.token,
        set: {
          userId,
          appId: dto.appId,
          deviceModel: dto.deviceModel,
          osVersion: dto.osVersion,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  async deletePushToken(userId: string, dto: DeletePushTokenDto) {
    await this.db
      .delete(schema.pushTokens)
      .where(
        and(
          eq(schema.pushTokens.token, dto.token),
          eq(schema.pushTokens.userId, userId),
          eq(schema.pushTokens.appId, dto.appId),
        ),
      );

    return { success: true };
  }

  async getPushTokens(userId: string, appId: string) {
    const tokens = await this.db
      .select({ token: schema.pushTokens.token })
      .from(schema.pushTokens)
      .where(
        and(
          eq(schema.pushTokens.userId, userId),
          eq(schema.pushTokens.appId, appId),
          eq(schema.pushTokens.isActive, true),
        ),
      );

    return tokens.map((t) => t.token);
  }

  async findUserByPhone(phoneNumber: string) {
    const user = await this.db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        phoneNumber: schema.user.phoneNumber,
      })
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, phoneNumber))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  }

  async sendTestNotificationByPhone(
    phoneNumber: string,
    appId?: string,
    payload?: Record<string, any>,
  ) {
    const user = await this.findUserByPhone(phoneNumber);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    let fcmResult:
      | { success: true; count: number }
      | { success: false; error: string }
      | null = null;
    if (appId) {
      try {
        const tokens = await this.getPushTokens(user.id, appId);
        if (tokens.length > 0) {
          // Convert data to string values for FCM compatibility
          const fcmData: Record<string, string> = {};
          if (payload) {
            for (const [key, value] of Object.entries(payload)) {
              if (value !== null && value !== undefined) {
                fcmData[key] =
                  typeof value === 'string' ? value : String(value);
              }
            }
          }

          const response = await admin.messaging().sendEachForMulticast({
            tokens,
            notification: {
              title: payload?.title || 'Notification',
              body: payload?.body || '',
            },
            data: fcmData,
            android: {
              priority: 'high',
              notification: {
                channelId: 'high_importance_channel',
                priority: 'high',
              },
            },
          });
          fcmResult = { success: true, count: response.successCount };

          // Handle invalid tokens
          if (response.failureCount > 0) {
            const invalidTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const code = resp.error?.code;
                if (
                  code === 'messaging/invalid-registration-token' ||
                  code === 'messaging/registration-token-not-registered'
                ) {
                  invalidTokens.push(tokens[idx]);
                }
              }
            });

            if (invalidTokens.length > 0) {
              for (const token of invalidTokens) {
                await this.db
                  .update(schema.pushTokens)
                  .set({ isActive: false, updatedAt: new Date() })
                  .where(eq(schema.pushTokens.token, token));
              }
            }
          }
        } else {
          fcmResult = {
            success: false,
            error: 'No active push tokens found for this app',
          };
        }
      } catch (err) {
        logger.error('FCM sending failed:', err);
        fcmResult = { success: false, error: String(err) };
      }
    } else {
      fcmResult = {
        success: false,
        error: 'appId is required to send FCM push notification',
      };
    }

    // Always create the polling notification
    const notification = await this.createTestNotification(user.id, payload);
    return { success: true, user, notification, fcmResult };
  }
}
