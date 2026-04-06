import {
  Controller,
  Get,
  Param,
  Sse,
  Req,
  Post,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBasicAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Observable } from 'rxjs';
import type { Request, Response } from 'express';
import { FourHourEventSchedulerService } from '../razorpay/scheduler/four-hour-event.scheduler';
import { AnalyticsService } from '../analytics/analytics.service';

// Extend Express Request to include admin property
declare module 'express' {
  interface Request {
    admin?: any;
  }
}

@ApiTags('admin')
@ApiBasicAuth('admin-basic')
@Controller('')
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
  async setCookie(
    @Body() body: { token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.token) {
      return { success: false, message: 'Token required' };
    }

    // Validate if the token belongs to an admin before setting the cookie
    try {
      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(body.token, jwtSecret);
      const userId = decoded.sub;

      const userRecords = await this.adminService.getUserById(userId);
      if (!userRecords) {
        return { success: false, message: 'User not found' };
      }

      const cleanUserPhone = (userRecords.phoneNumber || '').replace(/\D/g, '');
      const expectedMobile = process.env.ADMIN_MOBILE_NUMBER || '';
      const allowedAdminPhones = expectedMobile
        .split(',')
        .map((phone) => phone.trim().replace(/\D/g, ''))
        .filter((phone) => phone.length > 0);

      if (!cleanUserPhone || !allowedAdminPhones.includes(cleanUserPhone)) {
        return { success: false, message: 'Insufficient privileges' };
      }

      res.cookie('admin_token', body.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token or server configuration error',
      };
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear Admin UI HttpOnly cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token', { path: '/' });
    return { success: true };
  }

  @Get('check-session')
  @ApiOperation({ summary: 'Check if admin session is valid' })
  async checkSession(@Req() req: Request) {
    // Read token from cookie directly (this endpoint is exempt from auth middleware)
    let token: string | undefined;
    if (req.headers.cookie) {
      const cookies = req.headers.cookie
        .split(';')
        .map((c) => c.trim().split('='));
      const adminTokenCookie = cookies.find((c) => c[0] === 'admin_token');
      if (adminTokenCookie) {
        token = adminTokenCookie[1];
      }
    }

    if (!token) {
      return { authenticated: false };
    }

    try {
      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return { authenticated: false };
      }

      const decoded = jwt.verify(token, jwtSecret);
      const userId = decoded.sub;

      if (!userId) {
        return { authenticated: false };
      }

      // Check if user exists and has admin privileges
      const userRecords = await this.adminService.getUserById(userId);
      if (!userRecords) {
        return { authenticated: false };
      }

      const cleanUserPhone = (userRecords.phoneNumber || '').replace(/\D/g, '');
      const expectedMobile = process.env.ADMIN_MOBILE_NUMBER || '';
      const allowedAdminPhones = expectedMobile
        .split(',')
        .map((phone) => phone.trim().replace(/\D/g, ''))
        .filter((phone) => phone.length > 0);

      if (!cleanUserPhone || !allowedAdminPhones.includes(cleanUserPhone)) {
        return { authenticated: false };
      }

      return { authenticated: true, user: decoded };
    } catch (error) {
      return { authenticated: false };
    }
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
