import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import type { AiSuggestRequest, AiSuggestResponse, AiAnalyzeImageRequest } from './ai.types';

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

  @Post('analyze-image')
  @ApiOperation({ summary: 'Analyze image and generate suggestion', description: 'Analyzes a screenshot/image and generates a contextual response' })
  @ApiResponse({ status: 201, description: 'Image analyzed successfully' })
  @ApiResponse({ status: 503, description: 'AI service not configured' })
  async analyzeImage(@Body() body: AiAnalyzeImageRequest): Promise<AiSuggestResponse> {
    this.logger.log(`Analyzing image for category: ${body.category || 'general'}`);
    return this.aiService.analyzeImage(body);
  }
}
