import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService, AiSuggestRequest, AiSuggestResponse } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('suggest')
  @ApiOperation({ summary: 'Generate AI suggestion', description: 'Generates a response suggestion based on context' })
  @ApiResponse({ status: 201, description: 'Suggestion generated successfully' })
  @ApiResponse({ status: 503, description: 'AI service not configured' })
  async generateSuggestion(@Body() body: AiSuggestRequest): Promise<AiSuggestResponse> {
    this.logger.log(`Generating suggestion for category: ${body.category}`);
    return this.aiService.generateSuggestion(body);
  }
}
