import * as crypto from 'crypto';
import { ContentHandler, ContentMetadata } from './content-handler.interface';

export class TextContentHandler implements ContentHandler {
  canHandle(contentType: string, data: Buffer): boolean {
    return (
      contentType.includes('text/') ||
      contentType.includes('application/xml') ||
      contentType.includes('application/csv') ||
      contentType.includes('application/javascript')
    );
  }

  parse(data: Buffer): string {
    return data.toString('utf-8');
  }

  serialize(data: string): { content: string; metadata: ContentMetadata } {
    const text = typeof data === 'string' ? data : String(data);
    return {
      content: text,
      metadata: {
        type: 'text',
        mimeType: 'text/plain',
        sizeBytes: Buffer.byteLength(text),
        encoding: 'utf-8',
        extension: 'txt',
        checksum: this.computeChecksum(text),
      },
    };
  }

  extractFields(data: string, fields: string[]): Record<string, any> {
    // For text, we can extract via regex patterns if needed
    // For now, return empty or implement custom extraction
    const result: Record<string, any> = {};
    for (const field of fields) {
      // Simple regex extraction: field=value
      const regex = new RegExp(`${field}[:=]\\s*(.+?)(?:\\s|$)`, 'i');
      const match = data.match(regex);
      result[field] = match ? match[1].trim() : null;
    }
    return result;
  }

  private computeChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
