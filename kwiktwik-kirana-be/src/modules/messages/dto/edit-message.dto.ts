import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({ example: 'Updated message content' })
  @IsString()
  content: string;
}
