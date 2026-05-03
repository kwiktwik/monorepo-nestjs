import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import { UserV3Service } from './user-v3.service';

@ApiTags('User v3')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'X-App-ID',
  required: true,
  description: 'App identifier',
})
@Controller('user')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class UserV3Controller {
  constructor(private readonly userV3Service: UserV3Service) {}

  @Get()
  @Version('3')
  @ApiOperation({
    summary: 'Get user profile (v3)',
    description: 'Returns the user profile with premium status derived from the entitlements table.',
  })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(
    @CurrentUser() user: { userId: string },
    @AppId() appId: string,
  ) {
    return {
      success: true,
      data: await this.userV3Service.getUserProfile(user.userId, appId),
    };
  }
}