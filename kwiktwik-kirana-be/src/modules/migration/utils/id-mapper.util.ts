import { nanoid } from 'nanoid';
import { IdMappingEntry } from '../interfaces/migration.interfaces';

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
    const newId = nanoid();
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
    record: any,
    tableName: string,
    idFields: string[] = ['id'],
  ): any {
    const mapped = { ...record };

    // Map primary ID
    for (const field of idFields) {
      if (record[field]) {
        const newId = this.getNewId(tableName, record[field]);
        if (newId) {
          mapped[field] = newId;
        }
      }
    }

    // Map foreign keys based on table
    this.mapForeignKeys(mapped, tableName);

    return mapped;
  }

  /**
   * Map foreign key references
   */
  private mapForeignKeys(record: any, tableName: string): void {
    // User ID is always the same (not mapped)
    if (record.userId || record.user_id) {
      // Keep userId as-is, it's the same user
    }

    // Map subscription ID references
    if (record.subscriptionId || record.subscription_id) {
      const newSubId = this.getNewId(
        'subscriptions',
        record.subscriptionId || record.subscription_id,
      );
      if (newSubId) {
        if (record.subscriptionId) record.subscriptionId = newSubId;
        if (record.subscription_id) record.subscription_id = newSubId;
      }
    }

    // Map order ID references
    if (record.orderId || record.order_id) {
      const newOrderId = this.getNewId(
        'orders',
        record.orderId || record.order_id,
      );
      if (newOrderId) {
        if (record.orderId) record.orderId = newOrderId;
        if (record.order_id) record.order_id = newOrderId;
      }
    }

    // Map checkout ID references
    if (record.checkoutId || record.checkout_id) {
      const newCheckoutId = this.getNewId(
        'abandonedCheckouts',
        record.checkoutId || record.checkout_id,
      );
      if (newCheckoutId) {
        if (record.checkoutId) record.checkoutId = newCheckoutId;
        if (record.checkout_id) record.checkout_id = newCheckoutId;
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
