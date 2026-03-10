import { createHash } from 'crypto';
import { MigratableUserData } from '../interfaces/migration.interfaces';

/**
 * Calculate hash for migration data verification
 * Ensures data integrity after migration
 */
export class HashCalculator {
  /**
   * Calculate SHA256 hash of complete user data
   */
  static calculateDataHash(data: MigratableUserData): string {
    const normalized = this.normalizeData(data);
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  /**
   * Calculate hash for a specific table
   */
  static calculateTableHash(records: any[]): string {
    if (!records || records.length === 0) {
      return createHash('sha256').update('empty').digest('hex');
    }

    // Sort records by ID for consistency
    const sorted = [...records].sort((a, b) => {
      const aId = a.id || JSON.stringify(a);
      const bId = b.id || JSON.stringify(b);
      return String(aId).localeCompare(String(bId));
    });

    // Normalize each record (remove timestamps, sort keys)
    const normalized = sorted.map((record) => this.normalizeRecord(record));

    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  /**
   * Normalize data for consistent hashing
   * Removes timestamps and sorts keys
   */
  private static normalizeData(data: MigratableUserData): object {
    return {
      userId: data.userId,
      phoneNumber: data.phoneNumber,
      metadata: data.metadata.map((r) => this.normalizeRecord(r)),
      accounts: data.accounts.map((r) => this.normalizeRecord(r)),
      pushTokens: data.pushTokens.map((r) => this.normalizeRecord(r)),
      deviceSessions: data.deviceSessions.map((r) => this.normalizeRecord(r)),
      userImages: data.userImages.map((r) => this.normalizeRecord(r)),
      playStoreRatings: data.playStoreRatings.map((r) => this.normalizeRecord(r)),
      subscriptions: data.subscriptions.map((r) => this.normalizeRecord(r)),
      orders: data.orders.map((r) => this.normalizeRecord(r)),
      abandonedCheckouts: data.abandonedCheckouts.map((r) => this.normalizeRecord(r)),
      subscriptionLogs: data.subscriptionLogs.map((r) => this.normalizeRecord(r)),
      phonepeOrders: data.phonepeOrders.map((r) => this.normalizeRecord(r)),
      phonepeSubscriptions: data.phonepeSubscriptions.map((r) => this.normalizeRecord(r)),
    };
  }

  /**
   * Normalize a single record
   * - Sort keys alphabetically
   * - Remove timestamps that change
   * - Convert dates to ISO strings
   */
  private static normalizeRecord(record: any): object {
    if (!record || typeof record !== 'object') {
      return record;
    }

    const sorted: Record<string, any> = {};
    
    // Sort keys alphabetically
    const keys = Object.keys(record).sort();
    
    for (const key of keys) {
      // Skip internal/timestamp fields that change
      if (this.shouldSkipField(key)) {
        continue;
      }

      let value = record[key];

      // Normalize dates to ISO string
      if (value instanceof Date) {
        value = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        // Recursively normalize nested objects
        value = this.normalizeRecord(value);
      }

      sorted[key] = value;
    }

    return sorted;
  }

  /**
   * Fields to skip in hash calculation
   */
  private static shouldSkipField(key: string): boolean {
    const skipFields = [
      'createdAt',
      'updatedAt',
      'created_at',
      'updated_at',
      'timestamp',
      'lastHeartbeat',
      'last_heartbeat',
      'lockedAt',
      'locked_at',
    ];
    
    return skipFields.includes(key);
  }

  /**
   * Compare two hashes
   */
  static compareHashes(hash1: string, hash2: string): boolean {
    return hash1 === hash2;
  }
}
