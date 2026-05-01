export interface CompanionProfile {
  id: string;
  name: string;
  location: string;
  age: number;
  bio: string;
  description: string;
  imageUrls: string[];
  gifUrls: string[];
  interests: string[];
  isLocked: boolean;
  isSafeCompatible: boolean;
  freeChatCount: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionResponse {
  success: boolean;
  data: CompanionProfile[];
  count: number;
}