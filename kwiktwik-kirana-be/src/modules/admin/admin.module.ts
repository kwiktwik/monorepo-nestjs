import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PhonePeAdminController } from './phonepe-admin.controller';
import { RazorpayAdminController } from './razorpay-admin.controller';
import { PhonePeV2Module } from '../phonepe-v2/phonepe-v2.module';
import { RazorpayModule } from '../razorpay/razorpay.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import type { Request, Response, NextFunction } from 'express';

const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Read token from Bearer OR cookies OR query string
  let token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : (req.query.token as string);
  
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim().split('='));
    const adminTokenCookie = cookies.find(c => c[0] === 'admin_token');
    if (adminTokenCookie) {
      token = adminTokenCookie[1];
    }
  }

  // Exempt specific non-admin routes if needed
  if (req.path === '/api/admin/login' || req.path === '/api/admin/set-cookie' || req.path === '/api/admin/logout') {
    return next();
  }

  if (!token) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }
    // Redirect UI requests to login if no token
    return res.redirect('/admin/login');
  }

  try {
    const jwt = require('jsonwebtoken'); // Use the globally installed jsonwebtoken
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this',
    ) as any;

    if (decoded.role === 'admin') {
      return next();
    }
  } catch (e) {
    // ignore validation failures, will fallback to 401
  }

  res.status(401).json({ message: 'Authentication required' });
};

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
  ],
  providers: [AdminService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Protect both the static HTML path and the backend API path
    consumer
      .apply(adminAuthMiddleware)
      .forRoutes(
        { path: '/api/admin*path', method: RequestMethod.ALL },
      );
  }
}
