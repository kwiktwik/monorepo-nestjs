export interface ContentMetadata {
  type: 'json' | 'text' | 'binary' | 'image';
  mimeType: string;
  sizeBytes: number;
  encoding: string;
  extension: string;
  checksum: string;
}

export interface ContentHandler {
  canHandle(contentType: string, data: Buffer): boolean;
  parse(data: Buffer): any;
  serialize(data: any): { content: Buffer | string; metadata: ContentMetadata };
  extractFields(data: any, fields: string[]): Record<string, any>;
}
