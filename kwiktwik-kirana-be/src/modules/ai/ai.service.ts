import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiSuggestRequest {
  context: string;
  category: string;
  companionId?: string;
}

export interface AiSuggestResponse {
  success: boolean;
  suggestion: string;
  usage: {
    tokens: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || 
                  this.configService.get<string>('GEMINI_API_KEY_V1') || '';
    
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI suggestions will fail.');
    }
  }

  async generateSuggestion(data: AiSuggestRequest): Promise<AiSuggestResponse> {
    if (!this.apiKey) {
      throw new HttpException('AI service not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const { context, category, companionId } = data;

    // Build the prompt based on category
    let prompt = '';
    if (category === 'flirt') {
      prompt = `You are a smooth, charming, and witty dating assistant. 
      Context: ${context}
      Generate a short, engaging, and flirtatious response or conversation starter based on this context. 
      Keep it natural, playful, and not too creepy. Just the suggestion text, no labels.`;
    } else {
      prompt = `Context: ${context}
      Generate a helpful response for the category: ${category}.`;
    }

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Gemini API error:', JSON.stringify(errorData));
        throw new HttpException('Failed to generate suggestion', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const result = await response.json();
      const suggestion = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const tokens = result.usageMetadata?.totalTokenCount || 0;

      return {
        success: true,
        suggestion,
        usage: { tokens },
      };
    } catch (error) {
      this.logger.error('Error generating AI suggestion:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
