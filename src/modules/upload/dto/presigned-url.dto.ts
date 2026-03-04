import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class PresignedUrlDto {
  @ApiProperty({ example: 'pfp_1234567890.jpg', description: 'File name' })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({
    example: 'image/jpeg',
    description: 'MIME type',
    default: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  contentType?: string = 'image/jpeg';

  @ApiPropertyOptional({
    example: 3600,
    description: 'URL expiry in seconds (max 604800)',
    default: 3600,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(604800)
  expiresIn?: number = 3600;
}
