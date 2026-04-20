import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Memory thresholds for health status
 * These are tuned for a 2GB heap limit
 */
const MEMORY_THRESHOLDS = {
  // Warning: 70% of heap limit
  WARNING_MB: 1400,
  // Critical: 85% of heap limit
  CRITICAL_MB: 1700,
  // Heap limit for reference
  HEAP_LIMIT_MB: 2048,
};

interface HealthStatus {
  status: 'ok' | 'warning' | 'critical';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
    percentage: number;
    status: 'ok' | 'warning' | 'critical';
  };
  circuitBreaker?: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  @Get()
  @ApiOperation({ summary: 'Health check with memory monitoring' })
  @ApiResponse({ status: 200, description: 'Service status with memory metrics' })
  @ApiResponse({ status: 503, description: 'Service unhealthy - critical memory usage' })
  check(): HealthStatus {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);
    const externalMB = Math.round(mem.external / 1024 / 1024);
    const percentage = Math.round((mem.heapUsed / (MEMORY_THRESHOLDS.HEAP_LIMIT_MB * 1024 * 1024)) * 100);

    // Determine memory status
    let memoryStatus: 'ok' | 'warning' | 'critical' = 'ok';
    if (heapUsedMB >= MEMORY_THRESHOLDS.CRITICAL_MB) {
      memoryStatus = 'critical';
      this.logger.error(
        `CRITICAL: Memory usage at ${heapUsedMB}MB (${percentage}% of limit). ` +
          `Consider restarting the service or investigating memory leaks.`
      );
    } else if (heapUsedMB >= MEMORY_THRESHOLDS.WARNING_MB) {
      memoryStatus = 'warning';
      this.logger.warn(
        `WARNING: Memory usage at ${heapUsedMB}MB (${percentage}% of limit). ` +
          `Monitor for potential issues.`
      );
    }

    const healthStatus: HealthStatus = {
      status: memoryStatus === 'critical' ? 'critical' : 'ok',
      timestamp: new Date().toISOString(),
      service: 'kwiktwik-kirana-be',
      version: '1.0.0',
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      memory: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
        externalMB,
        percentage,
        status: memoryStatus,
      },
    };

    return healthStatus;
  }

  /**
   * Detailed health check for monitoring systems
   * Includes circuit breaker status and detailed metrics
   */
  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check for monitoring' })
  @ApiResponse({ status: 200, description: 'Detailed service status' })
  getDetailed(): HealthStatus & { nodeVersion: string; platform: string; pid: number } {
    const baseHealth = this.check();

    return {
      ...baseHealth,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    };
  }

  /**
   * Lightweight liveness probe for Kubernetes/load balancers
   * Returns 200 if the process is running, regardless of memory state
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - process is running' })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  liveness() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  /**
   * Readiness probe - service can accept traffic
   * Returns 503 if memory is critical
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe - service can accept traffic' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service not ready - critical memory' })
  readiness() {
    const health = this.check();

    if (health.status === 'critical') {
      // Return 503 for load balancers to stop routing traffic
      throw new Error('Service not ready - critical memory usage');
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      memoryStatus: health.memory.status,
    };
  }
}
