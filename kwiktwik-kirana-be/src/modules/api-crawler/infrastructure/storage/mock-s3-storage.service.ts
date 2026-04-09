import { Injectable } from '@nestjs/common';
import {
  StorageStrategy,
  StorageResult,
  StorageLocation,
} from '../../domain/entities/crawl-result.entity';
import { ContentMetadata } from '../../domain/entities/crawl-result.entity';

/**
 * Mock S3 Storage for Development
 * Stores files in memory (or local filesystem for persistence)
 */
@Injectable()
export class MockS3StorageStrategy implements StorageStrategy {
  private storage: Map<string, Buffer> = new Map();
  private metadata: Map<string, ContentMetadata> = new Map();
  private readonly mockBucket = 'mock-crawler-bucket';

  async store(
    jobId: string,
    content: Buffer | string,
    metadata: ContentMetadata,
  ): Promise<StorageResult> {
    const key = this.generateKey(jobId, metadata);
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

    // Check for content deduplication
    const existingKey = this.findByHash(metadata.checksum);
    if (existingKey) {
      // Return reference to existing content
      return {
        location: {
          type: 's3',
          bucket: this.mockBucket,
          key: existingKey,
          region: 'mock-region',
        },
        sizeBytes: metadata.sizeBytes,
        storedAt: new Date(),
      };
    }

    // Store new content
    this.storage.set(key, buffer);
    this.metadata.set(key, metadata);

    return {
      location: {
        type: 's3',
        bucket: this.mockBucket,
        key,
        region: 'mock-region',
      },
      sizeBytes: metadata.sizeBytes,
      storedAt: new Date(),
    };
  }

  async retrieve(location: StorageLocation): Promise<Buffer> {
    if (location.type !== 's3' || !location.key) {
      throw new Error('Invalid storage location');
    }

    const content = this.storage.get(location.key);
    if (!content) {
      throw new Error(`Content not found: ${location.key}`);
    }

    return content;
  }

  async delete(location: StorageLocation): Promise<void> {
    if (location.type !== 's3' || !location.key) {
      throw new Error('Invalid storage location');
    }

    this.storage.delete(location.key);
    this.metadata.delete(location.key);
  }

  /**
   * For testing: Get all stored keys
   */
  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  /**
   * For testing: Clear all storage
   */
  clear(): void {
    this.storage.clear();
    this.metadata.clear();
  }

  /**
   * For testing: Get storage size
   */
  getStorageSize(): number {
    let total = 0;
    for (const buffer of this.storage.values()) {
      total += buffer.length;
    }
    return total;
  }

  /**
   * For testing: Check if content exists by hash
   */
  hasContent(checksum: string): boolean {
    return this.findByHash(checksum) !== undefined;
  }

  private generateKey(jobId: string, metadata: ContentMetadata): string {
    const date = new Date().toISOString().split('T')[0];
    return `crawler/${date}/${jobId}.${metadata.extension}`;
  }

  private findByHash(checksum: string): string | undefined {
    for (const [key, meta] of this.metadata.entries()) {
      if (meta.checksum === checksum) {
        return key;
      }
    }
    return undefined;
  }
}
