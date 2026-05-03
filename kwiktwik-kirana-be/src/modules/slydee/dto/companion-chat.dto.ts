import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatHistoryMessageDto {
  @ApiProperty({ example: 'user', description: 'user or companion' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'Hey, how are you?' })
  @IsString()
  content: string;
}

export class CompanionChatDto {
  @ApiProperty({ example: 'uuid-of-companion' })
  @IsString()
  companionId: string;

  @ApiProperty({ example: 'Hey, what are you up to?' })
  @IsString()
  userMessage: string;

  @ApiProperty({
    type: [ChatHistoryMessageDto],
    required: false,
    description: 'Recent conversation history for context',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryMessageDto)
  chatHistory?: ChatHistoryMessageDto[];

  @ApiProperty({ example: 'hi', required: false, description: 'Language code' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    example: 'flirty',
    required: false,
    description: 'Response tone: flirty, witty, casual, bold, romantic',
  })
  @IsOptional()
  @IsString()
  tone?: string;
}

export class SwipeDto {
  @ApiProperty({ example: 'uuid-of-companion' })
  @IsString()
  companionId: string;

  @ApiProperty({
    example: 'right',
    enum: ['left', 'right'],
    description: 'Swipe direction: left = skip, right = like (creates match)',
  })
  @IsString()
  @IsIn(['left', 'right'])
  direction: 'left' | 'right';

  @ApiProperty({
    example: 'hi',
    required: false,
    description: 'Language for the AI greeting (only used on right swipe)',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    example: 'flirty',
    required: false,
    description:
      'Tone for the greeting (only used on right swipe): flirty, witty, casual, bold, romantic',
  })
  @IsOptional()
  @IsString()
  tone?: string;
}

export class RandomMatchDto {
  @ApiProperty({
    required: false,
    description: 'Only match with safe-compatible companions',
  })
  @IsOptional()
  @IsBoolean()
  safeOnly?: boolean;

  @ApiProperty({
    example: 'hi',
    required: false,
    description: 'Preferred language for the AI greeting',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    example: 'flirty',
    required: false,
    description: 'Tone for the greeting: flirty, witty, casual, bold, romantic',
  })
  @IsOptional()
  @IsString()
  tone?: string;
}