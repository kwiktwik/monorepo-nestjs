import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class LoginBaseDto {
  @ApiProperty({
    example: '+919876543210',
    description:
      'Phone number in E.164 format (required for kirana-fe detection)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+][1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phoneNumber: string;
}

export class LoginOtpDto extends LoginBaseDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be exactly 6 digits',
  })
  code: string;
}

export class LoginTruecallerDto {
  @ApiProperty({
    example: '+919876543210',
    description:
      'Phone number in E.164 format (optional for Truecaller, will be fetched from Truecaller profile)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[+][1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phoneNumber?: string;

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

export class LoginGoogleDto extends LoginBaseDto {
  @ApiProperty({
    example: 'google_id_token_jwt',
    description: 'Google ID token from Google Sign-In',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
