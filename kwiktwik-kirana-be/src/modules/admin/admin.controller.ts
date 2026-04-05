import { Controller, Get, Param, Sse, Req, Post, Query, Body, Res } from '@nestjs/common';
import { ApiTags, ApiBasicAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Observable } from 'rxjs';
import type { Request, Response } from 'express';
import { FourHourEventSchedulerService } from '../razorpay/scheduler/four-hour-event.scheduler';
import { AnalyticsService } from '../analytics/analytics.service';

@ApiTags('admin')
@ApiBasicAuth('admin-basic')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fourHourScheduler: FourHourEventSchedulerService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('scripts')
  @ApiOperation({ summary: 'List available admin scripts' })
  async getScripts() {
    const scripts = await this.adminService.getScripts();
    return { scripts };
  }

  @Post('set-cookie')
  @ApiOperation({ summary: 'Set HttpOnly cookie for Admin UI' })
  async setCookie(@Body() body: { token: string }, @Res({ passthrough: true }) res: Response) {
    // Basic structural validation; deep validation happens in the middleware.
    if (!body.token) {
      return { success: false };
    }
    res.cookie('admin_token', body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear Admin UI HttpOnly cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token', { path: '/' });
    return { success: true };
  }

  // Standard GET using Server-Sent Events to stream terminal output
  @Sse('scripts/:name/stream')
  streamScript(
    @Param('name') name: string,
    @Req() req: Request,
  ): Observable<{ data: any }> {
    let args: string[] = [];
    try {
      if (typeof req.query.args === 'string') {
        args = JSON.parse(req.query.args);
      }
    } catch (e) {
      args = []; // ignore parse error
    }

    return this.adminService.runScriptStream(name, args);
  }

  @Post('trigger-four-hour-cron')
  @ApiOperation({ summary: 'Manually trigger the four hour analytics cron' })
  async triggerFourHourCron() {
    await this.fourHourScheduler.processFourHourEvents();
    return { message: 'Four hour cron triggered successfully' };
  }

  @Post('test-analytics')
  @ApiOperation({ summary: 'Test analytics event sending' })
  async testAnalytics(@Query('appId') appId: string = 'com.kiranaapps.app') {
    const result = await this.analyticsService.sendEvent({
      eventName: 'test_event',
      userData: { email: 'test@example.com', userId: 'test-user-id' },
      eventProperties: { test: true },
      appId: appId,
    });
    return { result };
  }
}
