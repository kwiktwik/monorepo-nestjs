import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { SlydeeService } from './slydee.service';
import { SlydeeChatService } from './slydee-chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppId } from '../../common/decorators/app-id.decorator';
import {
  CompanionChatDto,
  RandomMatchDto,
  SwipeDto,
} from './dto/companion-chat.dto';
import type { CompanionResponse, CompanionProfile } from './slydee.types';

@ApiTags('slydee')
@Controller('slydee')
export class SlydeeController {
  private readonly logger = new Logger(SlydeeController.name);

  constructor(
    private readonly slydeeService: SlydeeService,
    private readonly slydeeChatService: SlydeeChatService,
  ) {}

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

  @Get('discover')
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true })
  @ApiOperation({
    summary: 'Get companion cards to swipe',
    description:
      'Returns companion profiles the user has not swiped on yet. Use the safeOnly query param to filter.',
  })
  @ApiResponse({ status: 200, description: 'List of unswiped companions' })
  async discover(
    @CurrentUser() user: any,
    @AppId() appId: string,
    @Query('safeOnly') safeOnly?: string,
  ) {
    return this.slydeeChatService.discover(
      user.userId,
      appId,
      safeOnly === 'true',
    );
  }

  @Post('swipe')
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true })
  @ApiOperation({
    summary: 'Swipe on a companion',
    description:
      'Records a left (skip) or right (like) swipe. Right swipe creates a match, conversation, and AI greeting.',
  })
  @ApiResponse({ status: 201, description: 'Swipe recorded' })
  async swipe(
    @Body() dto: SwipeDto,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    this.logger.log(
      `Swipe: user=${user.userId} companion=${dto.companionId} dir=${dto.direction}`,
    );
    return this.slydeeChatService.handleSwipe(user.userId, appId, dto);
  }

  @Get('matches')
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true })
  @ApiOperation({
    summary: 'Get user match history',
    description:
      'Returns the list of AI companions the user has been matched with, stored in userMetadata.',
  })
  @ApiResponse({ status: 200, description: 'Match history returned' })
  async getMatches(
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    return this.slydeeChatService.getMatches(user.userId, appId);
  }

  @Post('random-match')
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true })
  @ApiOperation({
    summary: 'Randomly match user with an AI companion',
    description:
      'Picks a random AI companion the user has not chatted with yet, creates a conversation, and returns an AI-generated greeting.',
  })
  @ApiResponse({ status: 201, description: 'Match created with greeting' })
  async randomMatch(
    @Body() dto: RandomMatchDto,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    this.logger.log(`Random match: user=${user.userId}`);
    return this.slydeeChatService.randomMatch(user.userId, appId, dto);
  }

  @Post('companion-chat')
  @UseGuards(AppIdGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiHeader({ name: 'X-App-ID', required: true })
  @ApiOperation({
    summary: 'Send message to AI companion and get reply',
    description:
      'Saves the user message, generates an AI companion reply using Vertex AI, saves the reply, and returns it.',
  })
  @ApiResponse({ status: 201, description: 'Companion reply generated' })
  async companionChat(
    @Body() dto: CompanionChatDto,
    @CurrentUser() user: any,
    @AppId() appId: string,
  ) {
    this.logger.log(
      `Companion chat: user=${user.userId} companion=${dto.companionId}`,
    );
    return this.slydeeChatService.handleChat(user.userId, appId, dto);
  }
}
