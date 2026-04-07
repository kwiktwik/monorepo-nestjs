import * as crypto from 'crypto';
import { ContentHandler, ContentMetadata } from './content-handler.interface';

export class BinaryContentHandler implements ContentHandler {
  canHandle(contentType: string, data: Buffer): boolean {
    return contentType.includes('image/') ||
           contentType.includes('application/pdf') ||
           contentType.includes('application/octet-stream') ||
           contentType.includes('video/') ||
           contentType.includes('audio/') ||
           contentType.includes('application/zip') ||
           contentType.includes('application/gzip');
  }

  parse(data: Buffer): Buffer {
    return data;
  }

  serialize(data: Buffer): { content: Buffer; metadata: ContentMetadata } {
    const mimeType = this.detectMimeType(data);
    return {
      content: data,
      metadata: {
        type: mimeType.startsWith('image/') ? 'image' : 'binary',
        mimeType,
        sizeBytes: data.length,
        encoding: 'binary',
        extension: this.getExtension(mimeType),
        checksum: crypto.createHash('sha256').update(data).digest('hex'),
      },
    };
  }

  extractFields(data: Buffer, fields: string[]): Record<string, any> {
    // Binary data doesn't have extractable fields
    return {};
  }

  private detectMimeType(data: Buffer): string {
    // Simple magic number detection
    if (data.length < 4) return 'application/octet-stream';
    
    // JPEG
    if (data[0] === 0xFF && data[1] === 0xD8) return 'image/jpeg';
    // PNG
    if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E) return 'image/png';
    // GIF
    if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'image/gif';
    // PDF
    if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44) return 'application/pdf';
    // ZIP
    if (data[0] === 0x50 && data[1] === 0x4B) return 'application/zip';
    // WebP
    if (data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42) return 'image/webp';
    
    return 'application/octet-stream';
  }

  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'application/zip': 'zip',
      'application/gzip': 'gz',
    };
    return map[mimeType] || 'bin';
  }
}
