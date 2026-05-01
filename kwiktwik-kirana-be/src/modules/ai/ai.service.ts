import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  VERTEX_AI_CONFIG,
  getVertexAccessToken,
} from '../../common/config/vertex-ai.config';
import type { AiSuggestRequest, AiSuggestResponse, AiAnalyzeImageRequest } from './ai.types';

const MODEL = 'gemini-2.5-flash-lite';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiUrl: string;

  constructor() {
    const { region, projectId } = VERTEX_AI_CONFIG;
    this.apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${MODEL}:generateContent`;
  }

  async generateSuggestion(data: AiSuggestRequest): Promise<AiSuggestResponse> {
    const { context, category, language } = data;

    const prompt =
      category === 'flirt'
        ? `You are a smooth, charming, and witty dating assistant. 
      Context: ${context}
      Generate a short, engaging, and flirtatious response or conversation starter based on this context. 
      Keep it natural, playful, and not too creepy. Just the suggestion text, no labels.`
        : `Context: ${context}
      Generate a helpful response for the category: ${category}.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    return this.callVertexApi(contents, language);
  }

  async analyzeImage(data: AiAnalyzeImageRequest): Promise<AiSuggestResponse> {
    const {
      image,
      mimeType = 'image/jpeg',
      prompt = 'Analyze this image and provide a relevant suggestion or description.',
      category,
    } = data;

    let instruction = prompt;
    if (category === 'flirt') {
      const extra =
        prompt !== 'Analyze this image and provide a relevant suggestion or description.'
          ? `Additional context: ${prompt}`
          : '';
      instruction = `You are a smooth, charming, and witty dating assistant. 
      Analyze the provided screenshot of a conversation or profile.
      ${extra}
      Generate a short, engaging, and flirtatious response, icebreaker, or conversation suggestion based on this image. 
      Keep it natural, playful, and not too creepy. Just the suggestion text, no labels.`;
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const contents = [
      {
        parts: [
          { text: instruction },
          { inlineData: { mimeType, data: base64Data } },
        ],
      },
    ];
    return this.callVertexApi(contents, data.language);
  }

  private buildLanguageInstruction(language?: string): string | undefined {
    if (!language) return undefined;

    const lang = language.toLowerCase();
    if (lang.startsWith('hi')) {
      return 'You MUST respond in Hindi or Hinglish (a natural mix of Hindi and English). Match the user\'s language style. Do NOT respond in pure English.';
    }
    if (lang.startsWith('en')) return undefined; // English is the model default
    return `You MUST respond in the language indicated by code "${language}". Match the user's language style.`;
  }

  private async callVertexApi(
    contents: unknown[],
    language?: string,
  ): Promise<AiSuggestResponse> {
    try {
      const token = await getVertexAccessToken();

      const langInstruction = this.buildLanguageInstruction(language);
      const payload: Record<string, unknown> = {
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
      };
      if (langInstruction) {
        payload.systemInstruction = {
          parts: [{ text: langInstruction }],
        };
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Vertex API error (${response.status}): ${errorBody}`);
        throw new HttpException(
          `AI service error: ${response.statusText || 'Unknown error'}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = await response.json();
      const suggestion =
        result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const tokens = result.usageMetadata?.totalTokenCount || 0;

      return { success: true, suggestion, usage: { tokens } };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Vertex API call failed:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
