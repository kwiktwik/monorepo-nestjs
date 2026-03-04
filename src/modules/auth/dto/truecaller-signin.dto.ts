import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TruecallerSigninDto {
  @ApiProperty({
    example: 'AUTHORIZATION_CODE',
    description: 'Truecaller authorization code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'CODE_VERIFIER',
    description: 'Code verifier for PKCE flow',
  })
  @IsString()
  @IsNotEmpty()
  code_verifier: string;

  @ApiProperty({
    example: 'elevc914vgrxlwfo1ywdmca7deykrlda66impggxoy0',
    description: 'Truecaller client ID',
  })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: 'authorization_code', description: 'Grant type' })
  @IsString()
  @IsNotEmpty()
  grant_type: string;
}
