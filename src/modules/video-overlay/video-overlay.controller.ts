import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
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
import { VideoOverlayService } from './video-overlay.service';
import { VideoOverlayByContentDto } from './dto/video-overlay-by-content.dto';

@ApiTags('video-overlay')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('video/overlay')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class VideoOverlayController {
  constructor(private readonly videoOverlayService: VideoOverlayService) {}

  @Get()
  @ApiOperation({ summary: 'Video overlay health check' })
  @ApiResponse({ status: 200, description: 'Service status and configuration' })
  getHealth() {
    return this.videoOverlayService.getHealth();
  }

  @Post('by-content-id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process video with overlay by content ID',
    description:
      'Overlays user image on video using content configuration from quotes table. Returns processed video URL.',
  })
  @ApiBody({ type: VideoOverlayByContentDto })
  @ApiResponse({ status: 200, description: 'Video processed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing/invalid data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async processByContentId(
    @AppId() _appId: string,
    @Body() dto: VideoOverlayByContentDto,
  ) {
    const result = await this.videoOverlayService.processByContentId(
      dto.contentId,
      dto.imageUrl,
      dto.imageData,
      {
        imagePercentageFromStart: dto.imagePercentageFromStart,
        imagePercentageFromTop: dto.imagePercentageFromTop,
        imagePercentageWidth: dto.imagePercentageWidth,
        imageShape: dto.imageShape,
        shapeImageUrl: dto.shapeImageUrl,
      },
    );

    if (!result.success) {
      throw new InternalServerErrorException({
        success: false,
        error: result.error ?? 'Video processing failed',
        processingTime: result.processingTime,
      });
    }

    return {
      success: true,
      videoUrl: result.videoUrl,
      processingTime: result.processingTime,
    };
  }
}
