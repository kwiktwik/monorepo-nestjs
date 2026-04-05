import { Module } from '@nestjs/common';
import { FeatureToggleController } from './feature-toggle.controller';
import { FeatureToggleService } from './feature-toggle.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';

@Module({
  controllers: [FeatureToggleController],
  providers: [FeatureToggleService],
  exports: [FeatureToggleService],
})
export class FeatureToggleModule {}
