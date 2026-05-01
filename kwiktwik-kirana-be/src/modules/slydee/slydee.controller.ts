import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SlydeeService } from './slydee.service';
import type { CompanionResponse, CompanionProfile } from './slydee.types';

@ApiTags('slydee')
@Controller('slydee')
export class SlydeeController {
  private readonly logger = new Logger(SlydeeController.name);

  constructor(private readonly slydeeService: SlydeeService) {}

  @Get('companions')
  @ApiOperation({ summary: 'Get all companions', description: 'Returns all companion profiles from the slydee app' })
  @ApiResponse({ status: 200, description: 'List of all companions' })
  getAllCompanions(): CompanionResponse {
    this.logger.log('Fetching all companions');
    return this.slydeeService.getAllCompanions();
  }

  @Get('companions/:id')
  @ApiOperation({ summary: 'Get companion by ID', description: 'Returns a specific companion profile by ID' })
  @ApiResponse({ status: 200, description: 'Companion profile found' })
  @ApiResponse({ status: 404, description: 'Companion not found' })
  getCompanionById(@Param('id') id: string): { success: boolean; data?: CompanionProfile; message?: string } {
    this.logger.log(`Fetching companion with ID: ${id}`);
    const companion = this.slydeeService.getCompanionById(id);

    if (!companion) {
      return {
        success: false,
        message: `Companion with ID ${id} not found`,
      };
    }

    return {
      success: true,
      data: companion,
    };
  }

  @Post('companions/reload')
  @ApiOperation({ summary: 'Reload companion data', description: 'Reloads companion data from the JSON file' })
  @ApiResponse({ status: 200, description: 'Data reloaded successfully' })
  reloadData(): CompanionResponse {
    this.logger.log('Reloading companion data');
    return this.slydeeService.reloadData();
  }
}
