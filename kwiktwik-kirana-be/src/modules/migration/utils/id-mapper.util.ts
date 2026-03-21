import { nanoid } from 'nanoid';
import { IdMappingEntry } from '../interfaces/migration.interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordData = Record<string, any>;

/**
 * ID Mapper for Migration
 * Maps old IDs from kirana-fe to new IDs in kwiktwik-kirana-be
 */
export class IdMapper {
  private mappings: Map<string, Map<string, string>> = new Map();

  /**
   * Generate new ID for a record
   */
  generateNewId(tableName: string, oldId: string): string {
    const newId = nanoid(10); // Generate 10 character ID to match schema
    this.setMapping(tableName, oldId, newId);
    return newId;
  }

  /**
   * Store ID mapping
   */
  setMapping(tableName: string, oldId: string, newId: string): void {
    if (!this.mappings.has(tableName)) {
      this.mappings.set(tableName, new Map());
    }
    this.mappings.get(tableName)!.set(oldId, newId);
  }

  /**
   * Get new ID from old ID
   */
  getNewId(tableName: string, oldId: string): string | undefined {
    return this.mappings.get(tableName)?.get(oldId);
  }

  /**
   * Check if mapping exists
   */
  hasMapping(tableName: string, oldId: string): boolean {
    return this.mappings.get(tableName)?.has(oldId) || false;
  }

  /**
   * Get all mappings for a table
   */
  getTableMappings(tableName: string): Map<string, string> | undefined {
    return this.mappings.get(tableName);
  }

  /**
   * Convert all IDs in a record using mappings
   */
  mapRecordIds(
    record: RecordData,
    tableName: string,
    idFields: string[] = ['id'],
  ): RecordData {
    const mapped = { ...record };

    // Map primary ID
    for (const field of idFields) {
      const fieldValue = record[field] as unknown;
      if (fieldValue && typeof fieldValue === 'string') {
        const newId = this.getNewId(tableName, fieldValue);
        if (newId) {
          mapped[field] = newId;
        }
      }
    }

    // Map foreign keys based on table
    this.mapForeignKeys(mapped);

    return mapped;
  }

  /**
   * Map foreign key references
   */
  private mapForeignKeys(record: RecordData): void {
    // User ID is always the same (not mapped)
    // Keep userId as-is, it's the same user

    // Map subscription ID references
    const subscriptionId = record.subscriptionId as string | undefined;
    const subscription_id = record.subscription_id as string | undefined;
    if (subscriptionId || subscription_id) {
      const oldId = subscriptionId || subscription_id;
      if (oldId && typeof oldId === 'string') {
        const newSubId = this.getNewId('subscriptions', oldId);
        if (newSubId) {
          if (record.subscriptionId) record.subscriptionId = newSubId;
          if (record.subscription_id) record.subscription_id = newSubId;
        }
      }
    }

    // Map order ID references
    const orderId = record.orderId as string | undefined;
    const order_id = record.order_id as string | undefined;
    if (orderId || order_id) {
      const oldId = orderId || order_id;
      if (oldId && typeof oldId === 'string') {
        const newOrderId = this.getNewId('orders', oldId);
        if (newOrderId) {
          if (record.orderId) record.orderId = newOrderId;
          if (record.order_id) record.order_id = newOrderId;
        }
      }
    }

    // Map checkout ID references
    const checkoutId = record.checkoutId as string | undefined;
    const checkout_id = record.checkout_id as string | undefined;
    if (checkoutId || checkout_id) {
      const oldId = checkoutId || checkout_id;
      if (oldId && typeof oldId === 'string') {
        const newCheckoutId = this.getNewId('abandonedCheckouts', oldId);
        if (newCheckoutId) {
          if (record.checkoutId) record.checkoutId = newCheckoutId;
          if (record.checkout_id) record.checkout_id = newCheckoutId;
        }
      }
    }
  }

  /**
   * Get all mappings as array
   */
  getAllMappings(): IdMappingEntry[] {
    const entries: IdMappingEntry[] = [];

    for (const [tableName, tableMap] of this.mappings.entries()) {
      for (const [oldId, newId] of tableMap.entries()) {
        entries.push({ tableName, oldId, newId });
      }
    }

    return entries;
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.mappings.clear();
  }

  /**
   * Get statistics
   */
  getStats(): { tables: number; totalMappings: number } {
    let totalMappings = 0;
    for (const tableMap of this.mappings.values()) {
      totalMappings += tableMap.size;
    }

    return {
      tables: this.mappings.size,
      totalMappings,
    };
  }
}
