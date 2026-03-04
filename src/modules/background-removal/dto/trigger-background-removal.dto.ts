import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUrl } from 'class-validator';

export class TriggerBackgroundRemovalDto {
  @ApiProperty({ description: 'Public URL of the uploaded image' })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ description: 'Database ID of the user image record' })
  @IsNumber()
  imageId: number;

  @ApiProperty({ description: 'R2 key for the image' })
  @IsString()
  key: string;
}
