import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service status' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'kwiktwik-kirana-be',
      version: '1.0.0',
    };
  }
}
