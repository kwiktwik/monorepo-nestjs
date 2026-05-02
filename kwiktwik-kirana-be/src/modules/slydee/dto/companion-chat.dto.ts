import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
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