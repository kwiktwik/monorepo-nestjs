import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientEventsController } from './client-events.controller';
import { ClientEventsService } from './client-events.service';

@Module({
  imports: [ConfigModule],
  controllers: [ClientEventsController],
  providers: [ClientEventsService],
})
export class ClientEventsModule {}