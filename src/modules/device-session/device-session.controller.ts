import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DeviceSessionService } from './device-session.service';
import { CreateDeviceSessionDto } from './dto/create-device-session.dto';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('device-session')
@Controller('device-session')
export class DeviceSessionController {
  constructor(private readonly deviceSessionService: DeviceSessionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-App-ID',
    required: true,
    description: 'App identifier',
  })
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiOperation({ summary: 'Record device session for Facebook CAPI' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateDeviceSessionDto,
  ) {
    try {
      const result = await this.deviceSessionService.create(user.userId, dto);

      if (!result.created) {
        return {
          success: true,
          message: result.message,
        };
      }

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      // Return 202 even on error - don't block the app
      return {
        success: false,
        message: 'Failed to record device session',
      };
    }
  }
}
