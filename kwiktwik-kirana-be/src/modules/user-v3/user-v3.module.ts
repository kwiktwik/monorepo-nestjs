import { Module } from '@nestjs/common';
import { UserV3Controller } from './user-v3.controller';
import { UserV3Service } from './user-v3.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';

@Module({
  imports: [PaymentGatewayModule],
  controllers: [UserV3Controller],
  providers: [UserV3Service],
})
export class UserV3Module {}