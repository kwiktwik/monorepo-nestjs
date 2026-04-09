import { describe, it, expect, beforeEach } from '@jest/globals';
import { PaginationStrategyFactory } from '../domain/strategies/pagination';
import { AuthStrategyFactory } from '../domain/strategies/auth';
import { ContentHandlerFactory } from '../domain/strategies/content';
import { MockS3StorageStrategy } from '../infrastructure/storage/mock-s3-storage.service';

describe('API Crawler Unit Tests', () => {
  // ==========================================
  // Pagination Strategy Tests
  // ==========================================
  describe('Pagination Strategies', () => {
    describe('NoPaginationStrategy', () => {
      it('should complete after single request', () => {
        const strategy = PaginationStrategyFactory.create('none');
        const context = strategy.getInitialContext();

        expect(context.hasMore).toBe(true);

        const updated = strategy.updateContext(context, { data: [1, 2, 3] });
        expect(updated.hasMore).toBe(false);
        expect(updated.itemsFetched).toBe(1);
      });
    });

    describe('OffsetPaginationStrategy', () => {
      it('should increment offset correctly', () => {
        const strategy = PaginationStrategyFactory.create('offset');
        const context = strategy.getInitialContext();
        const config = {
          offsetParam: 'offset',
          limitParam: 'limit',
          limitValue: 10,
          offsetStart: 0,
        };

        const params = strategy.buildNextRequest(context, {}, config);
        expect(params).toEqual({ offset: 0, limit: 10 });

        const updated = strategy.updateContext(
          context,
          { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
          config,
        );
        expect(updated.currentOffset).toBe(10);
        expect(updated.hasMore).toBe(true);
      });

      it('should detect end of results', () => {
        const strategy = PaginationStrategyFactory.create('offset');
        const context = strategy.getInitialContext();
        const config = {
          offsetParam: 'offset',
          limitParam: 'limit',
          limitValue: 10,
          offsetStart: 0,
        };

        const updated = strategy.updateContext(
          context,
          { data: [1, 2, 3] },
          config,
        );
        expect(updated.hasMore).toBe(false);
      });
    });

    describe('CursorPaginationStrategy', () => {
      it('should extract cursor from response', () => {
        const strategy = PaginationStrategyFactory.create('cursor');
        const context = strategy.getInitialContext();
        const config = {
          cursorParam: 'cursor',
          limitParam: 'limit',
          limitValue: 10,
          cursorPath: 'pagination.next_cursor',
        };

        const response = {
          data: [1, 2, 3],
          pagination: { next_cursor: 'abc123', has_more: true },
        };

        const updated = strategy.updateContext(context, response, config);
        expect(updated.currentCursor).toBe('abc123');
        expect(updated.hasMore).toBe(true);
      });

      it('should detect end when no cursor', () => {
        const strategy = PaginationStrategyFactory.create('cursor');
        const context = strategy.getInitialContext();
        const config = {
          cursorParam: 'cursor',
          limitParam: 'limit',
          limitValue: 10,
          cursorPath: 'pagination.next_cursor',
        };

        const response = {
          data: [1, 2, 3],
          pagination: { next_cursor: null, has_more: false },
        };

        const updated = strategy.updateContext(context, response, config);
        expect(updated.currentCursor).toBeNull();
        expect(updated.hasMore).toBe(false);
      });
    });

    describe('PageNumberPaginationStrategy', () => {
      it('should increment page number', () => {
        const strategy = PaginationStrategyFactory.create('page_number');
        const context = strategy.getInitialContext();
        const config = {
          pageParam: 'page',
          perPageParam: 'per_page',
          perPageValue: 20,
          startPage: 1,
        };

        const params = strategy.buildNextRequest(context, {}, config);
        expect(params).toEqual({ page: 1, per_page: 20 });

        const updated = strategy.updateContext(
          context,
          { data: Array(20).fill(1) },
          config,
        );
        expect(updated.currentPage).toBe(2);
      });
    });
  });

  // ==========================================
  // Auth Strategy Tests
  // ==========================================
  describe('Auth Strategies', () => {
    const baseRequest = {
      url: 'https://api.example.com/data',
      method: 'GET',
      headers: {},
      queryParams: {},
    };

    describe('NoAuthStrategy', () => {
      it('should not modify request', () => {
        const strategy = AuthStrategyFactory.create('none');
        const result = strategy.applyAuth(baseRequest, {});
        expect(result).toEqual(baseRequest);
      });
    });

    describe('ApiKeyAuthStrategy', () => {
      it('should add API key to header', () => {
        const strategy = AuthStrategyFactory.create('api_key');
        const result = strategy.applyAuth(baseRequest, {
          keyName: 'X-API-Key',
          keyValue: 'secret123',
          placement: 'header',
        });
        expect(result.headers).toEqual({ 'X-API-Key': 'secret123' });
      });

      it('should add API key to query params', () => {
        const strategy = AuthStrategyFactory.create('api_key');
        const result = strategy.applyAuth(baseRequest, {
          keyName: 'api_key',
          keyValue: 'secret123',
          placement: 'query',
        });
        expect(result.queryParams).toEqual({ api_key: 'secret123' });
      });
    });

    describe('BearerTokenAuthStrategy', () => {
      it('should add Authorization header', () => {
        const strategy = AuthStrategyFactory.create('bearer_token');
        const result = strategy.applyAuth(baseRequest, {
          token: 'jwt-token-123',
        });
        expect(result.headers).toEqual({
          Authorization: 'Bearer jwt-token-123',
        });
      });
    });

    describe('CustomHeaderAuthStrategy', () => {
      it('should add custom headers', () => {
        const strategy = AuthStrategyFactory.create('custom_header');
        const result = strategy.applyAuth(baseRequest, {
          headers: { 'X-Custom-Auth': 'value', 'X-Client-ID': 'client123' },
        });
        expect(result.headers).toEqual({
          'X-Custom-Auth': 'value',
          'X-Client-ID': 'client123',
        });
      });
    });
  });

  // ==========================================
  // Content Handler Tests
  // ==========================================
  describe('Content Handlers', () => {
    const factory = new ContentHandlerFactory();

    describe('JsonContentHandler', () => {
      it('should handle JSON content type', () => {
        const handler = factory.getHandler(
          'application/json',
          Buffer.from('{}'),
        );
        expect(handler.canHandle('application/json', Buffer.from('{}'))).toBe(
          true,
        );
      });

      it('should parse JSON correctly', () => {
        const handler = factory.getHandler(
          'application/json',
          Buffer.from('{}'),
        );
        const data = Buffer.from(JSON.stringify({ id: 1, name: 'Test' }));
        const parsed = handler.parse(data);
        expect(parsed).toEqual({ id: 1, name: 'Test' });
      });

      it('should serialize JSON correctly', () => {
        const handler = factory.getHandler(
          'application/json',
          Buffer.from('{}'),
        );
        const { content, metadata } = handler.serialize({
          id: 1,
          name: 'Test',
        });
        expect(JSON.parse(content as string)).toEqual({ id: 1, name: 'Test' });
        expect(metadata.type).toBe('json');
        expect(metadata.mimeType).toBe('application/json');
        expect(metadata.extension).toBe('json');
      });

      it('should extract nested fields', () => {
        const handler = factory.getHandler(
          'application/json',
          Buffer.from('{}'),
        );
        const data = { user: { id: 1, name: 'Test' }, status: 'active' };
        const fields = handler.extractFields(data, ['user.id', 'status']);
        expect(fields).toEqual({ 'user.id': 1, status: 'active' });
      });
    });

    describe('TextContentHandler', () => {
      it('should handle text content type', () => {
        const handler = factory.getHandler('text/plain', Buffer.from('Hello'));
        expect(handler.canHandle('text/plain', Buffer.from('Hello'))).toBe(
          true,
        );
      });

      it('should parse text correctly', () => {
        const handler = factory.getHandler('text/plain', Buffer.from('Hello'));
        const data = Buffer.from('Hello World');
        const parsed = handler.parse(data);
        expect(parsed).toBe('Hello World');
      });
    });

    describe('BinaryContentHandler', () => {
      it('should handle image content type', () => {
        const handler = factory.getHandler(
          'image/png',
          Buffer.from([0x89, 0x50]),
        );
        expect(handler.canHandle('image/png', Buffer.from([0x89, 0x50]))).toBe(
          true,
        );
      });

      it('should detect JPEG by magic number', () => {
        const handler = factory.getHandler(
          'application/octet-stream',
          Buffer.from([0xff, 0xd8]),
        );
        const jpegData = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
        const { metadata } = handler.serialize(jpegData);
        expect(metadata.mimeType).toBe('image/jpeg');
        expect(metadata.extension).toBe('jpg');
      });

      it('should detect PNG by magic number', () => {
        const handler = factory.getHandler(
          'application/octet-stream',
          Buffer.from([0x89, 0x50]),
        );
        const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        const { metadata } = handler.serialize(pngData);
        expect(metadata.mimeType).toBe('image/png');
        expect(metadata.extension).toBe('png');
      });
    });
  });

  // ==========================================
  // Storage Strategy Tests
  // ==========================================
  describe('MockS3StorageStrategy', () => {
    let storage: MockS3StorageStrategy;

    beforeEach(() => {
      storage = new MockS3StorageStrategy();
    });

    it('should store and retrieve content', async () => {
      const metadata = {
        type: 'json' as const,
        mimeType: 'application/json',
        sizeBytes: 100,
        encoding: 'utf-8',
        extension: 'json',
        checksum: 'abc123',
      };

      const result = await storage.store(
        'job-1',
        Buffer.from('{"test": true}'),
        metadata,
      );
      expect(result.location.type).toBe('s3');
      expect(result.sizeBytes).toBe(100);

      const retrieved = await storage.retrieve(result.location);
      expect(retrieved.toString()).toBe('{"test": true}');
    });

    it('should deduplicate content by checksum', async () => {
      const metadata = {
        type: 'json' as const,
        mimeType: 'application/json',
        sizeBytes: 100,
        encoding: 'utf-8',
        extension: 'json',
        checksum: 'dedup-checksum',
      };

      const result1 = await storage.store(
        'job-1',
        Buffer.from('content'),
        metadata,
      );
      const result2 = await storage.store(
        'job-2',
        Buffer.from('content'),
        metadata,
      );

      // Should reference same location
      expect(result1.location.key).toBe(result2.location.key);
    });

    it('should delete content', async () => {
      const metadata = {
        type: 'json' as const,
        mimeType: 'application/json',
        sizeBytes: 100,
        encoding: 'utf-8',
        extension: 'json',
        checksum: 'delete-test',
      };

      const result = await storage.store(
        'job-1',
        Buffer.from('content'),
        metadata,
      );
      await storage.delete(result.location);

      await expect(storage.retrieve(result.location)).rejects.toThrow(
        'Content not found',
      );
    });

    it('should track storage size', async () => {
      const metadata = {
        type: 'json' as const,
        mimeType: 'application/json',
        sizeBytes: 10,
        encoding: 'utf-8',
        extension: 'json',
        checksum: 'size-test-1',
      };

      await storage.store('job-1', Buffer.from('0123456789'), metadata);

      const metadata2 = { ...metadata, checksum: 'size-test-2' };
      await storage.store(
        'job-2',
        Buffer.from('01234567890123456789'),
        metadata2,
      );

      expect(storage.getStorageSize()).toBe(30);
    });

    it('should clear all storage', async () => {
      const metadata = {
        type: 'json' as const,
        mimeType: 'application/json',
        sizeBytes: 10,
        encoding: 'utf-8',
        extension: 'json',
        checksum: 'clear-test',
      };

      await storage.store('job-1', Buffer.from('content'), metadata);
      storage.clear();

      expect(storage.getAllKeys()).toHaveLength(0);
      expect(storage.getStorageSize()).toBe(0);
    });
  });
});
