import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginTruecallerDto {
  @ApiProperty({
    example: '+919876543210',
    description:
      'Phone number for kirana-fe detection (must match Truecaller profile)',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'authorization_code_from_truecaller',
    description: 'Truecaller authorization code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'code_verifier_from_pkce',
    description: 'PKCE code verifier',
  })
  @IsString()
  @IsNotEmpty()
  code_verifier: string;

  @ApiProperty({
    example: 'your_client_id',
    description: 'Truecaller OAuth client ID',
  })
  @IsString()
  @IsNotEmpty()
  client_id: string;
}
