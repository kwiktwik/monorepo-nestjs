import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';

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

export class LoginGoogleDto {
  @ApiProperty({
    example: '+919876543210',
    description:
      'Phone number in E.164 format (optional for Google login, used for kirana-fe detection)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[+][1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: 'google_id_token_jwt',
    description: 'Google ID token from Google Sign-In',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class LoginAnonymousDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIs...',
    description: 'Firebase ID token from signInAnonymously()',
  })
  @IsString()
  @IsNotEmpty()
  firebaseToken: string;
}

export enum LinkCredentialProvider {
  OTP = 'otp',
  GOOGLE = 'google',
  TRUECALLER = 'truecaller',
}

export class LinkCredentialDto {
  @ApiProperty({
    enum: LinkCredentialProvider,
    example: 'otp',
    description: 'Authentication provider to link',
  })
  @IsEnum(LinkCredentialProvider)
  provider: LinkCredentialProvider;

  @ApiProperty({
    example: '+919876543210',
    description: 'Phone number (required for OTP provider)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[+][1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code (required for OTP provider)',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 'google_id_token_jwt',
    description: 'Google ID token (required for Google provider)',
    required: false,
  })
  @IsString()
  @IsOptional()
  idToken?: string;

  @ApiProperty({
    description: 'PKCE code verifier (required for Truecaller provider)',
    required: false,
  })
  @IsString()
  @IsOptional()
  code_verifier?: string;

  @ApiProperty({
    description: 'Truecaller OAuth client ID (required for Truecaller provider)',
    required: false,
  })
  @IsString()
  @IsOptional()
  client_id?: string;
}
