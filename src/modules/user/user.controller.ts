import {
  Controller,
  Get,
  Post,
  Delete,
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
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserImageDto } from './dto/delete-user-image.dto';

interface AuthUser {
  userId: string;
  appId: string;
}

@ApiTags('user')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-App-ID', required: true, description: 'App identifier' })
@Controller('user')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('v1')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(@CurrentUser() user: AuthUser, @AppId() appId: string) {
    const userData = await this.userService.getUserProfile(user.userId, appId);

    return {
      success: true,
      data: userData,
    };
  }

  @Get('image/v1')
  @ApiOperation({ summary: 'List user images' })
  @ApiResponse({ status: 200, description: 'User images list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getImages(@CurrentUser() user: AuthUser, @AppId() appId: string) {
    const data = await this.userService.getUserImages(user.userId, appId);
    return { success: true, data };
  }

  @Delete('image/v1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteImage(
    @CurrentUser() user: AuthUser,
    @AppId() appId: string,
    @Body() dto: DeleteUserImageDto,
  ) {
    await this.userService.deleteUserImage(user.userId, appId, dto.imageId);
    return { success: true, message: 'Image deleted successfully' };
  }

  @Post('v1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUser(
    @CurrentUser() user: AuthUser,
    @AppId() appId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userData = await this.userService.updateUserProfile(
      user.userId,
      appId,
      updateUserDto,
    );

    return {
      success: true,
      message: 'User updated successfully',
      data: userData,
    };
  }

  @Delete('v1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@CurrentUser() user: AuthUser) {
    const result = await this.userService.deleteUser(user.userId);

    return result;
  }
}
