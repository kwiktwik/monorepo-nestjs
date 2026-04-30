import { Module } from '@nestjs/common';
import { SlydeeService } from './slydee.service';
import { SlydeeController } from './slydee.controller';

@Module({
  providers: [SlydeeService],
  controllers: [SlydeeController],
  exports: [SlydeeService],
})
export class SlydeeModule {}
