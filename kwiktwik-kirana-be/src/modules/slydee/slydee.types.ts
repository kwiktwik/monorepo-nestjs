export interface CommunicationStyle {
  warmExpressions: string[];
  laughPattern: string;
  textingStyle: string;
  fillerWords: {
    primary: string;
    alternatives: string[];
    frequencyLimit: string;
  };
  emojis: string[];
  defaultReactions: string[];
  dramaticExpressions: {
    examples: string[];
    frequencyLimit: string;
  };
}

export interface Moods {
  default: string;
  busy: string;
  happy: string;
  off: string;
  latenight: string;
}

export interface Boundaries {
  nsfwResponse: string;
  phoneNumberDeflection: string;
}

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
  // Detailed persona fields
  occupation?: string;
  livingSituation?: string;
  keyRelationships?: string[];
  educationBackground?: string;
  personalityTraits?: string[];
  quirks?: string[];
  comfortFood?: string;
  guiltyPleasures?: string[];
  sleepPattern?: string;
  mediaPreferences?: string[];
  communicationStyle?: CommunicationStyle;
  moods?: Moods;
  interruptions?: string[];
  storyArc?: string[];
  boundaries?: Boundaries;
  firstMessage?: string;
  antiPatterns?: string[];
}

export interface CompanionResponse {
  success: boolean;
  data: CompanionProfile[];
  count: number;
}