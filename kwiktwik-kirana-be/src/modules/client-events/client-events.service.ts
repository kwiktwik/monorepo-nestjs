import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IngestClientEventsDto } from './dto/client-event.dto';

@Injectable()
export class ClientEventsService {
  private readonly logger = new Logger(ClientEventsService.name);
  private readonly workerUrl: string;
  private readonly clientApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.workerUrl = this.configService.get<string>(
      'CLIENT_EVENTS_WORKER_URL',
      'https://events.kwiktwik.com',
    );
    this.clientApiKey = this.configService.get<string>(
      'CLIENT_EVENTS_API_KEY',
      '',
    );
  }

  /**
   * Forward client events to the Cloudflare Worker.
   * Fire-and-forget: returns immediately, logs errors but never throws.
   */
  async forwardEvents(
    userId: string,
    appId: string,
    dto: IngestClientEventsDto,
  ): Promise<{ accepted: boolean }> {
    if (!this.workerUrl || !this.clientApiKey) {
      this.logger.warn(
        'Client events worker not configured (CLIENT_EVENTS_WORKER_URL / CLIENT_EVENTS_API_KEY)',
      );
      return { accepted: false };
    }

    // Attach userId to each event before forwarding
    const events = dto.events.map((e) => ({ ...e, userId }));

    try {
      const response = await fetch(`${this.workerUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.clientApiKey,
        },
        body: JSON.stringify({ appId, events }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Worker responded ${response.status}: ${body}`,
        );
        return { accepted: false };
      }

      return { accepted: true };
    } catch (error) {
      this.logger.error(
        `Failed to forward events to worker: ${(error as Error).message}`,
      );
      return { accepted: false };
    }
  }
}