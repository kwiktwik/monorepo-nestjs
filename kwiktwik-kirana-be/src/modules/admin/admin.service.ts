import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import { Observable } from 'rxjs';
import { Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly scriptsDir = path.join(process.cwd(), 'scripts');

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getUserById(userId: string) {
    const userRecords = await this.db
      .select({ phoneNumber: schema.user.phoneNumber })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    return userRecords.length > 0 ? userRecords[0] : null;
  }

  async getScripts(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.scriptsDir);
      return files.filter((f) => f.endsWith('.mjs') || f.endsWith('.js'));
    } catch (error) {
      this.logger.error('Failed to read scripts directory', error);
      return [];
    }
  }

  runScriptStream(
    scriptName: string,
    args: string[] = [],
  ): Observable<{ data: string | any }> {
    return new Observable((subscriber) => {
      // Basic security check to prevent directory traversal
      if (scriptName.includes('/') || scriptName.includes('..')) {
        subscriber.next({
          data: JSON.stringify({ type: 'error', data: 'Invalid script name' }),
        });
        subscriber.complete();
        return;
      }

      const scriptPath = path.join(this.scriptsDir, scriptName);

      const child = spawn('node', [scriptPath, ...args], {
        cwd: process.cwd(),
        env: { ...process.env },
      });

      child.stdout.on('data', (data) => {
        subscriber.next({
          data: JSON.stringify({ type: 'stdout', data: data.toString() }),
        });
      });

      child.stderr.on('data', (data) => {
        subscriber.next({
          data: JSON.stringify({ type: 'stderr', data: data.toString() }),
        });
      });

      child.on('error', (error) => {
        subscriber.next({
          data: JSON.stringify({ type: 'error', data: error.message }),
        });
      });

      child.on('close', (code) => {
        subscriber.next({ data: JSON.stringify({ type: 'done', code }) });
        subscriber.complete();
      });

      // Cleanup logic on client disconnect
      return () => {
        if (child.pid && !child.killed) {
          try {
            process.kill(child.pid);
          } catch (e) {
            // Might have already exited
          }
        }
      };
    });
  }
}
