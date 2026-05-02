import {
  Controller,
  Get,
  Post,
  Body,
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
import { CompanionChatDto } from './dto/companion-chat.dto';
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
