/**
 * Data Transformation Service
 *
 * Transforms data from kirana-fe (old) format to kwiktwik-kirana-be (new) format
 * Uses schema mappings to ensure proper field mapping and validation
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  TableMapping,
  FieldMapping,
  ALL_TABLE_MAPPINGS,
} from '../config/schema-mappings.config';

export interface TransformResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

@Injectable()
export class DataTransformationService {
  private readonly logger = new Logger(DataTransformationService.name);

  /**
   * Parse a date value from various formats
   */
  private parseDate(value: unknown): Date | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
      // Handle various date string formats
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof value === 'number') {
      // Handle Unix timestamps (seconds or milliseconds)
      const timestamp = value > 9999999999 ? value : value * 1000;
      const parsed = new Date(timestamp);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  /**
   * Get value from record using multiple possible field names
   */
  private getFieldValue(record: any, fieldMapping: FieldMapping): any {
    // Try each possible field name in order
    for (const oldField of fieldMapping.oldFields) {
      if (record[oldField] !== undefined) {
        let value = record[oldField];

        // Apply date transformation if needed
        if (fieldMapping.isDate && value !== null) {
          value = this.parseDate(value);
        }

        // Apply custom transformation if provided
        if (fieldMapping.transform) {
          value = fieldMapping.transform(value);
        }

        return value;
      }
    }

    // Return default value if no field found
    if (fieldMapping.defaultValue !== undefined) {
      return typeof fieldMapping.defaultValue === 'function'
        ? fieldMapping.defaultValue()
        : fieldMapping.defaultValue;
    }

    return null;
  }

  /**
   * Transform a single record according to table mapping
   */
  transformRecord(
    record: any,
    tableMapping: TableMapping,
    idMapper?: { generateNewId: (table: string, oldId: string) => string },
    oldId?: string,
  ): TransformResult {
    const errors: string[] = [];
    const transformed: any = {};

    // Generate new ID if needed
    if (idMapper && oldId) {
      try {
        transformed.id = idMapper.generateNewId(tableMapping.tableName, oldId);
      } catch (error) {
        errors.push(`Failed to generate ID: ${error}`);
      }
    }

    // Transform each field
    for (const fieldMapping of tableMapping.fields) {
      try {
        // Skip id field if already set
        if (fieldMapping.newField === 'id' && transformed.id) {
          continue;
        }

        const value = this.getFieldValue(record, fieldMapping);
        transformed[fieldMapping.newField] = value;
      } catch (error) {
        errors.push(
          `Failed to transform field ${fieldMapping.newField}: ${error}`,
        );
      }
    }

    // Validate required fields
    for (const requiredField of tableMapping.requiredFields) {
      if (
        transformed[requiredField] === null ||
        transformed[requiredField] === undefined
      ) {
        errors.push(`Missing required field: ${requiredField}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: transformed,
    };
  }

  /**
   * Transform multiple records
   */
  transformRecords(
    records: any[],
    tableName: string,
    idMapper?: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const tableMapping = ALL_TABLE_MAPPINGS[tableName];
    if (!tableMapping) {
      throw new Error(`Unknown table mapping: ${tableName}`);
    }

    const success: any[] = [];
    const failed: { record: any; errors: string[] }[] = [];

    for (const record of records) {
      const oldId = record.id;
      const result = this.transformRecord(
        record,
        tableMapping,
        idMapper,
        oldId,
      );

      if (result.success && result.data) {
        success.push(result.data);
      } else {
        failed.push({
          record,
          errors: result.errors || ['Unknown error'],
        });
        this.logger.warn(
          `Failed to transform record for ${tableName}:`,
          result.errors,
        );
      }
    }

    return { success, failed };
  }

  /**
   * Transform subscriptions specifically
   */
  transformSubscriptions(
    records: any[],
    idMapper: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    return this.transformRecords(records, 'subscriptions', idMapper);
  }

  /**
   * Transform orders specifically
   */
  transformOrders(
    records: any[],
    idMapper: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    return this.transformRecords(records, 'orders', idMapper);
  }

  /**
   * Transform accounts specifically
   */
  transformAccounts(
    records: any[],
    idMapper: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    return this.transformRecords(records, 'accounts', idMapper);
  }

  /**
   * Transform user metadata specifically
   */
  transformUserMetadata(
    records: any[],
    userId: string,
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const results = this.transformRecords(records, 'user_metadata');
    // Override userId for metadata
    results.success.forEach((record) => {
      record.userId = userId;
    });
    return results;
  }

  /**
   * Transform push tokens specifically
   */
  transformPushTokens(
    records: any[],
    userId: string,
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const results = this.transformRecords(records, 'pushTokens');
    results.success.forEach((record) => {
      record.userId = userId;
    });
    return results;
  }

  /**
   * Transform device sessions specifically
   */
  transformDeviceSessions(
    records: any[],
    userId: string,
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const results = this.transformRecords(records, 'deviceSessions');
    results.success.forEach((record) => {
      record.userId = userId;
    });
    return results;
  }

  /**
   * Transform user images specifically
   */
  transformUserImages(
    records: any[],
    userId: string,
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const results = this.transformRecords(records, 'userImages');
    results.success.forEach((record) => {
      record.userId = userId;
    });
    return results;
  }

  /**
   * Transform play store ratings specifically
   */
  transformPlayStoreRatings(
    records: any[],
    userId: string,
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const results = this.transformRecords(records, 'playStoreRatings');
    results.success.forEach((record) => {
      record.userId = userId;
    });
    return results;
  }

  /**
   * Transform abandoned checkouts specifically
   */
  transformAbandonedCheckouts(
    records: any[],
    userId: string,
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    const results = this.transformRecords(records, 'abandonedCheckouts');
    results.success.forEach((record) => {
      record.userId = userId;
    });
    return results;
  }

  /**
   * Transform PhonePe orders specifically
   */
  transformPhonepeOrders(
    records: any[],
    idMapper: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    return this.transformRecords(records, 'phonepeOrders', idMapper);
  }

  /**
   * Transform PhonePe subscriptions specifically
   */
  transformPhonepeSubscriptions(
    records: any[],
    idMapper: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    return this.transformRecords(records, 'phonepeSubscriptions', idMapper);
  }

  /**
   * Transform enhanced notifications specifically
   */
  transformEnhancedNotifications(
    records: any[],
    idMapper: { generateNewId: (table: string, oldId: string) => string },
  ): { success: any[]; failed: { record: any; errors: string[] }[] } {
    return this.transformRecords(records, 'enhancedNotifications', idMapper);
  }

  /**
   * Get field mapping info for debugging
   */
  getFieldMappingInfo(tableName: string): TableMapping | null {
    return ALL_TABLE_MAPPINGS[tableName] || null;
  }

  /**
   * Validate a record without transforming
   */
  validateRecord(record: any, tableName: string): ValidationError[] {
    const tableMapping = ALL_TABLE_MAPPINGS[tableName];
    if (!tableMapping) {
      return [{ field: 'table', message: `Unknown table: ${tableName}` }];
    }

    const errors: ValidationError[] = [];

    for (const requiredField of tableMapping.requiredFields) {
      const fieldMapping = tableMapping.fields.find(
        (f) => f.newField === requiredField,
      );
      if (!fieldMapping) continue;

      const value = this.getFieldValue(record, fieldMapping);
      if (value === null || value === undefined) {
        errors.push({
          field: requiredField,
          message: `Required field ${requiredField} is missing`,
        });
      }
    }

    return errors;
  }
}
