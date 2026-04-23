import { Controller, Get } from '@nestjs/common';

/**
 * Root controller - returns deployment info at /
 */
@Controller()
export class RootController {
  @Get()
  getRoot() {
    const now = new Date();
    // Indian time is UTC+5:30
    const indianTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

    // Format: 23 Jan 2025, 06:15:30 PM IST
    const indianTimeReadable = indianTime.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';

    return {
      message: 'KwikTwik Kirana API',
      status: 'running',
      deployed: now.toISOString(),
      deployedIndianTime: indianTimeReadable,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
