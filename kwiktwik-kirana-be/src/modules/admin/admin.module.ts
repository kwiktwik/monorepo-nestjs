import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  Injectable,
  NestMiddleware,
  Inject,
  Logger,
} from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PhonePeAdminController } from './phonepe-admin.controller';
import { RazorpayAdminController } from './razorpay-admin.controller';
import { FeatureToggleAdminController } from './feature-toggle-admin.controller';
import { FeatureToggleAdminService } from './feature-toggle-admin.service';
import { PhonePeV2Module } from '../phonepe-v2/phonepe-v2.module';
import { RazorpayModule } from '../razorpay/razorpay.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to serve index.html for SPA routes
 * This handles client-side routing refresh for the admin UI
 */
@Injectable()
export class AdminSpaFallbackMiddleware implements NestMiddleware {
  private readonly indexPath = join(
    process.cwd(),
    'public',
    'admin',
    'index.html',
  );

  use(req: Request, res: Response, next: NextFunction) {
    // Skip API routes and file requests with extensions
    if (req.path.startsWith('/api/') || req.path.match(/\.[^/]+$/)) {
      return next();
    }

    // For all other routes under /admin, serve index.html
    res.sendFile(this.indexPath, (err) => {
      if (err) {
        next(err);
      }
    });
  }
}

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminAuthMiddleware.name);

  constructor(private readonly adminService: AdminService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Determine if this is an API request
    const isApiRequest =
      req.path.startsWith('/api/') ||
      req.headers.accept?.includes('application/json');

    // 2. Extract token from Bearer OR cookies OR query string
    let token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : (req.query.token as string);

    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie
        .split(';')
        .map((c) => c.trim().split('='));
      const adminTokenCookie = cookies.find((c) => c[0] === 'admin_token');
      if (adminTokenCookie) {
        token = adminTokenCookie[1];
      }
    }

    // 3. Handle Exemptions
    // check-session: returns { authenticated: false } instead of 401
    // set-cookie: performs its own validation
    // logout: clearing cookies is safe
    const exemptedPaths = ['/set-cookie', '/logout', '/check-session'];
    if (exemptedPaths.some((p) => req.path.endsWith(p))) {
      return next();
    }

    // 4. Validate Token Existence
    if (!token) {
      if (isApiRequest) {
        return res
          .status(401)
          .json({ success: false, message: 'Admin authentication required.' });
      }
      return res.redirect('/admin/login');
    }

    // 5. Verify Admin Credentials
    const expectedMobile = process.env.ADMIN_MOBILE_NUMBER;
    if (!expectedMobile) {
      this.logger.error('ADMIN_MOBILE_NUMBER not configured');
      return res
        .status(500)
        .json({ success: false, message: 'Server configuration error' });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        this.logger.error('JWT_SECRET not configured');
        return res
          .status(500)
          .json({ success: false, message: 'Server configuration error' });
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, jwtSecret);

      const userId = decoded.sub;
      if (!userId) {
        throw new Error('Invalid token structure');
      }

      // Check database for admin privileges
      const userRecords = await this.adminService.getUserById(userId);
      if (!userRecords) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found' });
      }

      const cleanUserPhone = (userRecords.phoneNumber || '').replace(
        /\D/g,
        '',
      );
      const allowedAdminPhones = expectedMobile
        .split(',')
        .map((phone) => phone.trim().replace(/\D/g, ''))
        .filter((phone) => phone.length > 0);

      if (!cleanUserPhone || !allowedAdminPhones.includes(cleanUserPhone)) {
        return res
          .status(403)
          .json({ success: false, message: 'Insufficient privileges' });
      }

      req['admin'] = decoded;
      next();
    } catch (error) {
      this.logger.warn(`Admin auth failed for ${req.path}: ${error.message}`);
      if (isApiRequest) {
        return res
          .status(401)
          .json({ success: false, message: 'Invalid or expired token' });
      }
      return res.redirect('/admin/login');
    }
  }
}

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'admin'),
      serveRoot: '/admin',
      serveStaticOptions: {
        index: ['index.html'],
      },
    }),
    PhonePeV2Module,
    RazorpayModule,
    AnalyticsModule,
  ],
  controllers: [
    AdminController,
    PhonePeAdminController,
    RazorpayAdminController,
    FeatureToggleAdminController,
  ],
  providers: [
    AdminService,
    AdminAuthMiddleware,
    AdminSpaFallbackMiddleware,
    FeatureToggleAdminService,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply SPA fallback middleware for admin routes (must be before auth middleware)
    // This handles client-side routing refresh for React Router
    consumer
      .apply(AdminSpaFallbackMiddleware)
      .forRoutes({ path: '/admin*path', method: RequestMethod.ALL });

    // Protect all API routes under the admin context
    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        AdminController,
        PhonePeAdminController,
        RazorpayAdminController,
        FeatureToggleAdminController,
      );
  }
}
