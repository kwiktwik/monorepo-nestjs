import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsAdminController } from './apps.admin.controller';

@Module({
  providers: [AppsService],
  controllers: [AppsAdminController],
  exports: [AppsService],
})
export class AppsModule {}
