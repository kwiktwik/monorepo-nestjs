import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadService } from './upload.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@ApiTags('upload')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('upload')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({
    summary: 'Get presigned URL',
    description:
      'Get a presigned URL for uploading user images to R2/S3. Requires JWT.',
  })
  @ApiBody({ type: PresignedUrlDto })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPresignedUrl(
    @CurrentUser() user: { userId: string; appId: string },
    @AppId() appId: string,
    @Body() dto: PresignedUrlDto,
  ) {
    return this.uploadService.getPresignedUrl(user.userId, appId, dto);
  }
}
