import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BackgroundRemovalService } from './background-removal.service';
import { TriggerBackgroundRemovalDto } from './dto/trigger-background-removal.dto';

/**
 * Triggers background removal for uploaded images.
 * Processes in background - returns immediately.
 */
@ApiTags('background-removal')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('background-removal')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class BackgroundRemovalController {
  constructor(
    private readonly backgroundRemovalService: BackgroundRemovalService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger background removal' })
  @ApiBody({ type: TriggerBackgroundRemovalDto })
  @ApiResponse({ status: 200, description: 'Background removal task queued' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 500,
    description: 'Failed to trigger background removal',
  })
  trigger(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
    @Body() dto: TriggerBackgroundRemovalDto,
  ) {
    this.backgroundRemovalService.trigger(dto.imageUrl, dto.imageId, dto.key);
    return {
      success: true,
      message: 'Background removal task queued',
      imageId: dto.imageId,
    };
  }
}
