import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'uuid-of-conversation' })
  @IsUUID()
  conversationId: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  content: string;

  @ApiProperty({ enum: ['text', 'image', 'video', 'file'], example: 'text', required: false })
  @IsOptional()
  @IsEnum(['text', 'image', 'video', 'file'])
  type?: string;

  @ApiProperty({ example: 'uuid-of-message-to-reply-to', required: false })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
