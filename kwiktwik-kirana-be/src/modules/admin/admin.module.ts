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

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminAuthMiddleware.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Read token from Bearer OR cookies OR query string
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

    // Exempt specific non-admin routes if needed
    if (
      req.path === '/api/admin/login' ||
      req.path === '/api/admin/set-cookie' ||
      req.path === '/api/admin/logout'
    ) {
      return next();
    }

    if (!token) {
      if (req.path.startsWith('/api/')) {
        return res
          .status(401)
          .json({ success: false, message: 'Admin authentication required.' });
      }
      return res.redirect('/admin/login');
    }

    const expectedMobile = process.env.ADMIN_MOBILE_NUMBER;
    if (!expectedMobile) {
      return res
        .status(401)
        .json({ success: false, message: 'Admin credentials not configured' });
    }

    try {
      // Ensure JWT_SECRET is configured
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        this.logger.error('JWT_SECRET environment variable is not configured');
        return res
          .status(500)
          .json({ success: false, message: 'Server configuration error' });
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, jwtSecret);

      // decoded.sub contains userId
      const userId = decoded.sub;
      if (!userId) {
        throw new Error('Invalid token structure');
      }

      // Check token expiration explicitly
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        throw new Error('Token has expired');
      }

      // Query database for the user's phone number
      const userRecords = await this.db
        .select({ phoneNumber: schema.user.phoneNumber })
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (userRecords.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found' });
      }

      const cleanUserPhone = (userRecords[0].phoneNumber || '').replace(
        /\D/g,
        '',
      );
      const cleanAdminPhone = expectedMobile.replace(/\D/g, '');

      if (!cleanUserPhone || cleanUserPhone !== cleanAdminPhone) {
        return res
          .status(403)
          .json({ success: false, message: 'Insufficient privileges' });
      }

      req['admin'] = decoded;
      next();
    } catch (error) {
      if (req.path.startsWith('/api/')) {
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
  providers: [AdminService, AdminAuthMiddleware, FeatureToggleAdminService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Protect both the static HTML path and the backend API path
    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes({ path: '/api/admin*path', method: RequestMethod.ALL });
  }
}
