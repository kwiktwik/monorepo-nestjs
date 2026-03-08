import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ enum: ['direct', 'group'], example: 'group' })
  @IsEnum(['direct', 'group'])
  type: 'direct' | 'group';

  @ApiProperty({
    type: [String],
    example: ['uuid-of-user-1', 'uuid-of-user-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @ApiProperty({ example: 'Team Chat', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'A group for team discussions', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
