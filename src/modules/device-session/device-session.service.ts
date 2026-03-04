import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { deviceSessions } from '../../database/schema';
import { desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { CreateDeviceSessionDto } from './dto/create-device-session.dto';
import type * as schema from '../../database/schema';

@Injectable()
export class DeviceSessionService {
  private readonly logger = new Logger(DeviceSessionService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Create device session if major fields changed
   */
  async create(
    userId: string,
    dto: CreateDeviceSessionDto,
  ): Promise<{ created: boolean; message: string }> {
    try {
      // Get the last device session for this user
      const lastSession = await this.db
        .select({
          deviceModel: deviceSessions.deviceModel,
          osVersion: deviceSessions.osVersion,
          appVersion: deviceSessions.appVersion,
        })
        .from(deviceSessions)
        .where(eq(deviceSessions.userId, userId))
        .orderBy(desc(deviceSessions.createdAt))
        .limit(1);

      // Check if major fields changed
      const hasChanged =
        lastSession.length === 0 ||
        lastSession[0].deviceModel !== dto.deviceModel ||
        lastSession[0].osVersion !== dto.osVersion ||
        lastSession[0].appVersion !== dto.appVersion;

      if (!hasChanged) {
        return { created: false, message: 'No change detected' };
      }

      // Insert new device session
      await this.db.insert(deviceSessions).values({
        userId,
        appId: dto.appId,
        deviceModel: dto.deviceModel || null,
        osVersion: dto.osVersion || null,
        appVersion: dto.appVersion || null,
        platform: dto.platform || null,
        manufacturer: dto.manufacturer || null,
        brand: dto.brand || null,
        locale: dto.locale || null,
        timezone: dto.timezone || null,
      });

      this.logger.log(`Device session recorded for user ${userId}`);
      return { created: true, message: 'Device session recorded' };
    } catch (error) {
      this.logger.error('Failed to record device session', error);
      throw error;
    }
  }

  /**
   * Get latest device session for user
   */
  async getLatestForUser(userId: string) {
    const sessions = await this.db
      .select()
      .from(deviceSessions)
      .where(eq(deviceSessions.userId, userId))
      .orderBy(desc(deviceSessions.createdAt))
      .limit(1);

    return sessions[0] || null;
  }
}
