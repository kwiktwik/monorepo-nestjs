import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FeedService } from './feed.service';

@ApiTags('feed')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('feed')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Get categories',
    description: 'Returns distinct categoryType from quotes for feed filters.',
  })
  @ApiResponse({ status: 200, description: 'Categories returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCategories(@AppId() appId: string) {
    return this.feedService.getCategories(appId);
  }

  @Get('home/v1.7')
  @ApiOperation({
    summary: 'Get home feed',
    description: 'Returns paginated home feed items from quotes table.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default 20)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by categoryType',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Pagination cursor',
  })
  @ApiResponse({ status: 200, description: 'Home feed returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHomeFeed(
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('cursor') cursor?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) || 20 : 20;
    return this.feedService.getHomeFeed(limitNum, category, cursor);
  }
}
