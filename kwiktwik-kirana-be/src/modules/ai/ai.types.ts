export interface AiSuggestRequest {
  context: string;
  category: string;
  companionId?: string;
  language?: string;
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
  language?: string;
}