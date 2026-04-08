/**
 * Payments Module
 *
 * A loosely coupled payment abstraction for multiple providers (Razorpay, PhonePe).
 *
 * Loose coupling guarantees:
 * - No dependency on UserModule, OrderModule, or any business modules
 * - No direct DB access (Drizzle/Token injection avoided)
 * - Only depends on NestJS ConfigService
 * - Can be extracted as microservice without touching other code
 *
 * Usage in other modules:
 *   import { PaymentService } from '../payments';
 *   constructor(private payments: PaymentService) {}
 *   const order = await this.payments.createOrder('razorpay', { appId, amount });
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './service/payment.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
