import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPlansDto {
  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: 'plan_S3FaBrk7sjPQEU',
  })
  @IsOptional()
  @IsString()
  plan_id?: string;
}