import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import * as fs from 'fs/promises';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Mock fs/promises
jest.mock('fs/promises');

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

describe('AdminService', () => {
  let service: AdminService;
  let mockSpawn: jest.MockedFunction<typeof spawn>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScripts', () => {
    it('should return list of script files', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        'script1.mjs',
        'script2.js',
        'readme.txt',
        'data.json',
      ]);

      const result = await service.getScripts();

      expect(result).toEqual(['script1.mjs', 'script2.js']);
      expect(fs.readdir).toHaveBeenCalled();
    });

    it('should return empty array when no scripts found', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        'readme.txt',
        'data.json',
      ]);

      const result = await service.getScripts();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (fs.readdir as jest.Mock).mockRejectedValue(
        new Error('Permission denied'),
      );

      const result = await service.getScripts();

      expect(result).toEqual([]);
    });

    it('should handle directory not found error', async () => {
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      (fs.readdir as jest.Mock).mockRejectedValue(error);

      const result = await service.getScripts();

      expect(result).toEqual([]);
    });
  });

  describe('runScriptStream', () => {
    function createMockChildProcess(): EventEmitter & Partial<ChildProcess> {
      const emitter = new EventEmitter();
      return Object.assign(emitter, {
        stdout: new EventEmitter(),
        stderr: new EventEmitter(),
        pid: 12345,
        killed: false,
        kill: jest.fn(),
      }) as EventEmitter & Partial<ChildProcess>;
    }

    it('should stream stdout data', (done) => {
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const messages: any[] = [];

      observable.subscribe({
        next: (data) => {
          messages.push(JSON.parse(data.data));
        },
        complete: () => {
          expect(messages).toContainEqual(
            expect.objectContaining({
              type: 'stdout',
              data: 'Hello from script',
            }),
          );
          done();
        },
      });

      // Simulate stdout data
      (mockChild.stdout as EventEmitter).emit('data', Buffer.from('Hello from script'));
      mockChild.emit('close', 0);
    });

    it('should stream stderr data', (done) => {
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const messages: any[] = [];

      observable.subscribe({
        next: (data) => {
          messages.push(JSON.parse(data.data));
        },
        complete: () => {
          expect(messages).toContainEqual(
            expect.objectContaining({
              type: 'stderr',
              data: 'Error message',
            }),
          );
          done();
        },
      });

      // Simulate stderr data
      (mockChild.stderr as EventEmitter).emit('data', Buffer.from('Error message'));
      mockChild.emit('close', 0);
    });

    it('should handle process errors', (done) => {
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const messages: any[] = [];

      observable.subscribe({
        next: (data) => {
          messages.push(JSON.parse(data.data));
        },
        complete: () => {
          expect(messages).toContainEqual(
            expect.objectContaining({
              type: 'error',
              data: 'Spawn failed',
            }),
          );
          done();
        },
      });

      mockChild.emit('error', new Error('Spawn failed'));
      // Error event doesn't trigger close, so we need to complete manually for test
      setTimeout(() => mockChild.emit('close', 1), 10);
    }, 10000);

    it('should include exit code on close', (done) => {
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const messages: any[] = [];

      observable.subscribe({
        next: (data) => {
          messages.push(JSON.parse(data.data));
        },
        complete: () => {
          expect(messages).toContainEqual(
            expect.objectContaining({
              type: 'done',
              code: 1,
            }),
          );
          done();
        },
      });

      mockChild.emit('close', 1);
    });

    it('should reject scripts with directory traversal', (done) => {
      const observable = service.runScriptStream('../etc/passwd');

      observable.subscribe({
        next: (data) => {
          const parsed = JSON.parse(data.data);
          expect(parsed.type).toBe('error');
          expect(parsed.data).toContain('Invalid');
        },
        complete: () => {
          expect(mockSpawn).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should reject scripts with / in name', (done) => {
      const observable = service.runScriptStream('scripts/test.mjs');

      observable.subscribe({
        next: (data) => {
          const parsed = JSON.parse(data.data);
          expect(parsed.type).toBe('error');
        },
        complete: () => {
          expect(mockSpawn).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should reject scripts with .. in name', (done) => {
      const observable = service.runScriptStream('script..js');

      observable.subscribe({
        next: (data) => {
          const parsed = JSON.parse(data.data);
          expect(parsed.type).toBe('error');
        },
        complete: () => {
          done();
        },
      });
    });

    it('should pass arguments to script', (done) => {
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs', ['arg1', 'arg2']);

      observable.subscribe({
        complete: () => {
          expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            expect.arrayContaining([expect.stringContaining('test.mjs'), 'arg1', 'arg2']),
            expect.objectContaining({
              cwd: process.cwd(),
              env: expect.any(Object),
            }),
          );
          done();
        },
      });

      mockChild.emit('close', 0);
    });

    it('should kill process on unsubscribe', (done) => {
      const mockKill = jest.spyOn(process, 'kill').mockImplementation(() => true);
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const subscription = observable.subscribe({
        next: () => {},
      });

      // Wait for subscription to be set up
      setTimeout(() => {
        subscription.unsubscribe();
        expect(mockKill).toHaveBeenCalledWith(12345);
        mockKill.mockRestore();
        done();
      }, 10);
    });

    it('should handle kill error on unsubscribe gracefully', (done) => {
      const mockKill = jest.spyOn(process, 'kill').mockImplementation(() => {
        throw new Error('Process already exited');
      });
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const subscription = observable.subscribe({
        next: () => {},
      });

      setTimeout(() => {
        // Should not throw
        expect(() => subscription.unsubscribe()).not.toThrow();
        mockKill.mockRestore();
        done();
      }, 10);
    });

    it('should not kill if process already killed', (done) => {
      const mockKill = jest.spyOn(process, 'kill').mockImplementation(() => true);
      const mockChild = createMockChildProcess();
      mockChild.killed = true;
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const subscription = observable.subscribe({
        next: () => {},
      });

      setTimeout(() => {
        subscription.unsubscribe();
        expect(mockKill).not.toHaveBeenCalled();
        mockKill.mockRestore();
        done();
      }, 10);
    });

    it('should handle multiple stdout chunks', (done) => {
      const mockChild = createMockChildProcess();
      mockSpawn.mockReturnValue(mockChild as ChildProcess);

      const observable = service.runScriptStream('test.mjs');
      const messages: any[] = [];

      observable.subscribe({
        next: (data) => {
          messages.push(JSON.parse(data.data));
        },
        complete: () => {
          expect(messages.filter((m) => m.type === 'stdout')).toHaveLength(3);
          done();
        },
      });

      (mockChild.stdout as EventEmitter).emit('data', Buffer.from('Line 1\n'));
      (mockChild.stdout as EventEmitter).emit('data', Buffer.from('Line 2\n'));
      (mockChild.stdout as EventEmitter).emit('data', Buffer.from('Line 3\n'));
      mockChild.emit('close', 0);
    });
  });
});
