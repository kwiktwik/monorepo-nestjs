import { Module } from '@nestjs/common';
import { PhonePeController } from './phonepe.controller';
import { PhonePeService } from './phonepe.service';
import { MockPhonePeService } from './phonepe.mock.service';
import { isMockMode } from '../../common/utils/is-mock-mode';

const phonePeProvider = {
  provide: PhonePeService,
  useClass: isMockMode() ? MockPhonePeService : PhonePeService,
};

@Module({
  controllers: [PhonePeController],
  providers: [phonePeProvider],
  exports: [PhonePeService],
})
export class PhonePeModule {}
