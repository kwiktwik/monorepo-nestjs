import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class VideoOverlayByContentDto {
  @ApiProperty({ description: 'Content ID from quotes table' })
  @IsInt()
  contentId!: number;

  @ApiPropertyOptional({ description: 'URL of the image to overlay' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Base64 encoded image data' })
  @IsOptional()
  @IsString()
  imageData?: string;

  @ApiPropertyOptional({
    description: 'Image X position as % of video width (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  imagePercentageFromStart?: number;

  @ApiPropertyOptional({
    description: 'Image Y position as % of video height (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  imagePercentageFromTop?: number;

  @ApiPropertyOptional({
    description: 'Image width as % of video width (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  imagePercentageWidth?: number;

  @ApiPropertyOptional({
    description: 'Shape of the overlay',
    enum: ['CIRCLE', 'SQUARE', 'RECTANGLE', 'ROUNDED_RECTANGLE', 'FLOWER'],
  })
  @IsOptional()
  @IsString()
  imageShape?: string;

  @ApiPropertyOptional({ description: 'URL of custom shape mask image' })
  @IsOptional()
  @IsString()
  shapeImageUrl?: string;
}
