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

const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Allow the login endpoint to be unauthenticated!
  if (req.path === '/api/admin/login') {
    return next();
  }

  let token = '';

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
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
