import { Module } from '@nestjs/common';
import { PrometheusModule } from '../prometheus';
import { PaywallController } from './paywall.controller';
import { PaywallService } from './paywall.service';

@Module({
  imports: [PrometheusModule],
  controllers: [PaywallController],
  providers: [PaywallService],
  exports: [PaywallService],
})
export class PaywallModule {}