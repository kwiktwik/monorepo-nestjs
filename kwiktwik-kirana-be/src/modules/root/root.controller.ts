import { Controller, Get } from '@nestjs/common';

/**
 * Root controller - returns deployment info at /
 */
@Controller()
export class RootController {
  @Get()
  getRoot() {
    return {
      message: 'KwikTwik Kirana API',
      status: 'running',
      deployed: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
