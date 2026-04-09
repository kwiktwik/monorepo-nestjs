import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppId } from '../../common/decorators/app-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserImageDto } from './dto/delete-user-image.dto';
import { SubmitPlayStoreRatingDto } from './dto/submit-play-store-rating.dto';

interface AuthUser {
  userId: string;
  appId: string;
}

@ApiTags('user')
@ApiBearerAuth('JWT')
@Controller('user')
@UseGuards(AppIdGuard, JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  private logRequestStart(
    endpoint: string,
    userId: string,
    appId?: string,
  ): number {
    this.logger.log(
      `[${endpoint}] Request started - userId: ${userId}${appId ? `, appId: ${appId}` : ''}`,
    );
    return Date.now();
  }

  private logRequestSuccess(
    endpoint: string,
    userId: string,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;
    this.logger.log(
      `[${endpoint}] Success - userId: ${userId}, duration: ${duration}ms`,
    );
  }

  private logRequestFailure(
    endpoint: string,
    userId: string,
    startTime: number,
    error: unknown,
  ): void {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(
      `[${endpoint}] Failed - userId: ${userId}, duration: ${duration}ms, error: ${errorMessage}`,
    );
  }

  @Get('v1')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(@CurrentUser() user: AuthUser, @AppId() appId: string) {
    const endpoint = 'GET /v1/user';
    const startTime = this.logRequestStart(endpoint, user.userId, appId);
    try {
      const userData = await this.userService.getUserProfile(
        user.userId,
        appId,
      );
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }

  @Get()
  @Version('2')
  @ApiOperation({ summary: 'Get user profile with logging' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserV2(@CurrentUser() user: AuthUser, @AppId() appId: string) {
    const endpoint = 'GET /v2/user';
    const startTime = this.logRequestStart(endpoint, user.userId, appId);
    try {
      const userData = await this.userService.getUserProfileV2(
        user.userId,
        appId,
      );
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return { success: true, data: userData };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }

  @Get('image/v1')
  @ApiOperation({ summary: 'List user images' })
  @ApiResponse({ status: 200, description: 'User images list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getImages(@CurrentUser() user: AuthUser, @AppId() appId: string) {
    const endpoint = 'GET /v1/user/image';
    const startTime = this.logRequestStart(endpoint, user.userId, appId);
    try {
      const data = await this.userService.getUserImages(user.userId, appId);
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return { success: true, data };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
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
    const endpoint = 'DELETE /v1/user/image';
    const startTime = this.logRequestStart(endpoint, user.userId, appId);
    try {
      await this.userService.deleteUserImage(user.userId, appId, dto.imageId);
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }

  @Post('v1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates user profile information including name, phone, email, UPI VPA, profile images, and clientData. Performs phone number uniqueness validation and syncs images to user_images table. The clientData field allows storing arbitrary JSON data for client application use.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: 'user-id',
          name: 'John Doe',
          phoneNumber: '+919876543210',
          email: 'john@example.com',
          accountType: 'credentials',
          emailVerified: true,
          phoneNumberVerified: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          appId: 'alertpay-default',
          isPremium: false,
          upiVpa: 'user@paytm',
          audioLanguage: 'en-US',
          clientData: {
            theme: 'dark',
            notifications: true,
            preferences: {
              language: 'en',
            },
          },
          images: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid input data or phone number already in use',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @CurrentUser() user: AuthUser,
    @AppId() appId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const endpoint = 'POST /v1/user';
    const startTime = this.logRequestStart(endpoint, user.userId, appId);
    try {
      const userData = await this.userService.updateUserProfile(
        user.userId,
        appId,
        updateUserDto,
      );

      this.logRequestSuccess(endpoint, user.userId, startTime);
      return {
        success: true,
        message: 'User updated successfully',
        data: userData,
      };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }

  @Delete('v1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@CurrentUser() user: AuthUser) {
    const endpoint = 'DELETE /v1/user';
    const startTime = this.logRequestStart(endpoint, user.userId);
    try {
      const result = await this.userService.deleteUser(user.userId);
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return result;
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }

  @Get('migration-status/v1')
  @ApiOperation({
    summary: 'Check if user is migrated from kirana-fe',
    description:
      'Returns migration status for the authenticated user. Checks migration_logs table to determine if user data was migrated from the legacy kirana-fe app.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration status retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          isMigrated: true,
          migrationDetails: {
            migrationId: '550e8400-e29b-41d4-a716-446655440000',
            status: 'completed',
            startedAt: '2024-01-15T10:30:00.000Z',
            completedAt: '2024-01-15T10:35:00.000Z',
            recordsMigrated: 150,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User not migrated',
    schema: {
      example: {
        success: true,
        data: {
          isMigrated: false,
          migrationDetails: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async checkMigrationStatus(@CurrentUser() user: AuthUser) {
    const endpoint = 'GET /v1/user/migration-status';
    const startTime = this.logRequestStart(endpoint, user.userId);
    try {
      const data = await this.userService.checkMigrationStatus(user.userId);
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return { success: true, data };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }

  @Post('playstore-rating/v1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit Play Store rating',
    description:
      'Allows the authenticated user to submit their app rating and review to the Play Store ratings table.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating submitted successfully',
    schema: {
      example: {
        success: true,
        message: 'Rating submitted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid rating value',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async submitPlayStoreRating(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitPlayStoreRatingDto,
  ) {
    const endpoint = 'POST /v1/user/playstore-rating';
    const startTime = this.logRequestStart(endpoint, user.userId, user.appId);
    try {
      await this.userService.submitPlayStoreRating(
        user.userId,
        user.appId,
        dto,
      );
      this.logRequestSuccess(endpoint, user.userId, startTime);
      return { success: true, message: 'Rating submitted successfully' };
    } catch (error) {
      this.logRequestFailure(endpoint, user.userId, startTime, error);
      throw error;
    }
  }
}
