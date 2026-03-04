import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteUserImageDto {
  @ApiProperty({ example: 1, description: 'ID of the image to delete' })
  @IsInt()
  @IsNotEmpty()
  imageId: number;
}
