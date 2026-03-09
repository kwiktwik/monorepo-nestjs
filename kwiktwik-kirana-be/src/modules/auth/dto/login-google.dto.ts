import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Phone number for kirana-fe detection (E.164 format)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'google_id_token_jwt',
    description: 'Google ID token from Google Sign-In',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
