import { ContentHandler } from './content-handler.interface';
import { JsonContentHandler } from './json-handler';
import { TextContentHandler } from './text-handler';
import { BinaryContentHandler } from './binary-handler';

export class ContentHandlerFactory {
  private handlers: ContentHandler[] = [
    new JsonContentHandler(),
    new TextContentHandler(),
    new BinaryContentHandler(),
  ];

  getHandler(contentType: string, data: Buffer): ContentHandler {
    // Try explicit content type first
    for (const handler of this.handlers) {
      if (handler.canHandle(contentType, data)) {
        return handler;
      }
    }
    // Default to binary
    return this.handlers[this.handlers.length - 1];
  }

  // For testing purposes
  registerHandler(handler: ContentHandler): void {
    this.handlers.unshift(handler);
  }
}
