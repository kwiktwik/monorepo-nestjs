import { Controller, Get, Param, Sse, Req } from '@nestjs/common';
import { ApiTags, ApiBasicAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Observable } from 'rxjs';
import type { Request } from 'express';

@ApiTags('admin')
@ApiBasicAuth('admin-basic')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('scripts')
  @ApiOperation({ summary: 'List available admin scripts' })
  async getScripts() {
    const scripts = await this.adminService.getScripts();
    return { scripts };
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
}
