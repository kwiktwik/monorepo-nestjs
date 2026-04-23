import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

/**
 * Interceptor that automatically tracks HTTP request metrics for Prometheus
 * Records request count and duration for each endpoint
 * 
 * Usage:
 * - Apply to a controller: @UseInterceptors(PrometheusMetricsInterceptor)
 * - Apply to specific methods: @UseInterceptors(PrometheusMetricsInterceptor)
 */
@Injectable()
export class PrometheusMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get route pattern if available, otherwise use path
    const route = request.route?.path || request.path || 'unknown';
    const method = request.method || 'UNKNOWN';
    
    // Record start time
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(method, route, response.statusCode, startTime);
        },
        error: (error) => {
          // Record with error status code (500 or error's status)
          const statusCode = error.status || 500;
          this.recordMetrics(method, route, statusCode, startTime);
        },
      }),
    );
  }

  private recordMetrics(
    method: string,
    route: string,
    statusCode: number,
    startTime: number,
  ): void {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    
    // Record request count
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });

    // Record request duration
    this.httpRequestDuration.observe(
      { method, route },
      duration,
    );
  }
}
