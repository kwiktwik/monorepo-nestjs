import { Injectable, NotFoundException } from '@nestjs/common';
import { getConfigForAppId } from './config.data';

@Injectable()
export class ConfigService {
  getConfig(appId: string): Record<string, any> {
    const config = getConfigForAppId(appId);

    if (!config) {
      throw new NotFoundException(
        `Configuration not found for app ID: ${appId}`,
      );
    }

    return config;
  }
}
