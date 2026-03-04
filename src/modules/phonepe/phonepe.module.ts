import { Module } from '@nestjs/common';
import { PhonePeController } from './phonepe.controller';
import { PhonePeService } from './phonepe.service';

@Module({
  controllers: [PhonePeController],
  providers: [PhonePeService],
  exports: [PhonePeService],
})
export class PhonePeModule {}
