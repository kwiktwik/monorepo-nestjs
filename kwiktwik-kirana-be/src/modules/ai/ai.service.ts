import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';

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

export interface AiAnalyzeImageRequest {
  image: string;
  mimeType?: string;
  prompt?: string;
  category?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly auth: GoogleAuth;
  private readonly projectId = 'storyowl-kwiktwik';
  private readonly region = 'us-east1';
  private readonly model = 'gemini-2.5-flash-lite';
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.auth = new GoogleAuth({
      keyFile: './secrets/vertex-ai-storyowl-key.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    this.apiUrl = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/publishers/google/models/${this.model}:generateContent`;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const client = await this.auth.getClient();
      const tokenResponse = await client.getAccessToken();
      if (!tokenResponse.token) throw new Error('Token is empty');
      return tokenResponse.token;
    } catch (error) {
      this.logger.error('Failed to get Vertex AI token:', error);
      throw new HttpException('AI service auth failed', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async generateSuggestion(data: AiSuggestRequest): Promise<AiSuggestResponse> {

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

    this.logger.debug(`Generating AI suggestion for category: ${category}`);

    try {
      const token = await this.getAccessToken();
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        let errorDetails: string;
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (parseError) {
          const errorText = await response.text();
          errorDetails = errorText || `HTTP ${response.status} ${response.statusText}`;
        }
        this.logger.error(`Gemini API error (status: ${response.status}): ${errorDetails}`);
        throw new HttpException(`AI service error: ${response.statusText || 'Unknown error'}`, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async analyzeImage(data: AiAnalyzeImageRequest): Promise<AiSuggestResponse> {
    const { image, mimeType = 'image/jpeg', prompt = 'Analyze this image and provide a relevant suggestion or description.', category } = data;

    let systemInstruction = prompt;
    if (category === 'flirt') {
      systemInstruction = `You are a smooth, charming, and witty dating assistant. 
      Analyze the provided screenshot of a conversation or profile.
      ${prompt !== 'Analyze this image and provide a relevant suggestion or description.' ? `Additional context: ${prompt}` : ''}
      Generate a short, engaging, and flirtatious response, icebreaker, or conversation suggestion based on this image. 
      Keep it natural, playful, and not too creepy. Just the suggestion text, no labels.`;
    }

    this.logger.debug(`Analyzing image for category: ${category || 'general'}`);

    // Clean base64 string if it has data URI prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    try {
      const token = await this.getAccessToken();
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemInstruction },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
          },
        }),
      });

      if (!response.ok) {
        let errorDetails: string;
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (parseError) {
          const errorText = await response.text();
          errorDetails = errorText || `HTTP ${response.status} ${response.statusText}`;
        }
        this.logger.error(`Gemini API error (status: ${response.status}): ${errorDetails}`);
        throw new HttpException(`AI service error: ${response.statusText || 'Unknown error'}`, HttpStatus.INTERNAL_SERVER_ERROR);
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
      this.logger.error('Error analyzing image:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
