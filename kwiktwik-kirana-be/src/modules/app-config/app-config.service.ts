import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { validateAppSettings } from '../../common/config/config.schemas';
import type { AppConfigResponse } from './types/app-config.types';

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get app configuration (database-driven).
   * Validates the DB settings JSON and passes it through as-is.
   */
  async getConfig(appId: string): Promise<AppConfigResponse> {
    const rows = await this.db
      .select()
      .from(schema.apps)
      .where(eq(schema.apps.id, appId))
      .limit(1);

    const app = rows[0];
    if (!app) {
      throw new NotFoundException(`App "${appId}" is not registered`);
    }

    const result = validateAppSettings(app.settings || {});
    if (!result.success) {
      this.logger.error(
        `Invalid config for ${appId}: ${result.errors.join(', ')}`,
      );
      throw new InternalServerErrorException('App configuration is invalid');
    }

    return {
      app: { name: app.name, id: app.id },
      ...result.data,
    };
  }
}
