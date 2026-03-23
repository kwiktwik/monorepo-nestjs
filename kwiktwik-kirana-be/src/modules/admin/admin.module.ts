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
import { PhonePeV2Module } from '../phonepe-v2/phonepe-v2.module';
import type { Request, Response, NextFunction } from 'express';

const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Simple Basic Auth for internal scripts dashboard
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64')
    .toString()
    .split(':');

  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass =
    process.env.ADMIN_PASSWORD || 'K!r@nA$Admin_2026_#Secur3'; // Complex default

  if (
    login &&
    password &&
    login === expectedUser &&
    password === expectedPass
  ) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin Scripts Access"');
  res.status(401).send('Authentication required.');
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
  ],
  controllers: [AdminController, PhonePeAdminController],
  providers: [AdminService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Protect both the static HTML path and the backend API path
    consumer
      .apply(basicAuthMiddleware)
      .forRoutes(
        { path: '/admin*path', method: RequestMethod.ALL },
        { path: '/api/admin*path', method: RequestMethod.ALL },
      );
  }
}
