import { Module } from '@nestjs/common';
import { DbDebugController } from './db-debug.controller';

@Module({
  controllers: [DbDebugController],
})
export class DbDebugModule {}
