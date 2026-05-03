import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import {
  plans,
  type Plan,
} from '../payment-gateway/database/schema';

@Injectable()
export class PaywallService {
  private readonly logger = new Logger(PaywallService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async getPlans(appId: string): Promise<Plan[]> {
    this.logger.debug(`Fetching active plans for appId: ${appId}`);

    const rows = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.appId, appId), eq(plans.isActive, true)));

    return rows;
  }

  async getPlanById(appId: string, planId: string): Promise<Plan> {
    this.logger.debug(`Fetching plan ${planId} for appId: ${appId}`);

    const rows = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.appId, appId)));

    if (rows.length === 0) {
      throw new NotFoundException(`Plan ${planId} not found for app ${appId}`);
    }

    return rows[0];
  }
}