import * as crypto from 'crypto';
import { ContentHandler, ContentMetadata } from './content-handler.interface';

export class JsonContentHandler implements ContentHandler {
  canHandle(contentType: string, data: Buffer): boolean {
    return contentType.includes('application/json') || 
           contentType.includes('application/javascript') ||
           contentType.includes('text/json');
  }

  parse(data: Buffer): any {
    const str = data.toString('utf-8');
    try {
      return JSON.parse(str);
    } catch (e) {
      // If parsing fails, return as text
      return str;
    }
  }

  serialize(data: any): { content: string; metadata: ContentMetadata } {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return {
      content: jsonString,
      metadata: {
        type: 'json',
        mimeType: 'application/json',
        sizeBytes: Buffer.byteLength(jsonString),
        encoding: 'utf-8',
        extension: 'json',
        checksum: this.computeChecksum(jsonString),
      },
    };
  }

  extractFields(data: any, fields: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const field of fields) {
      result[field] = this.getNestedValue(data, field);
    }
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  private computeChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
