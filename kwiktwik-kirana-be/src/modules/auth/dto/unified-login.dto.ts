import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { LoginOtpDto } from './login-otp.dto';
import { LoginTruecallerDto } from './login-truecaller.dto';
import { LoginGoogleDto } from './login-google.dto';

type ProviderType = 'otp' | 'truecaller' | 'google';

export class UnifiedLoginDto {
  @ApiProperty({
    description: 'Authentication provider type',
    enum: ['otp', 'truecaller', 'google'],
    example: 'otp',
  })
  @IsString()
  @IsNotEmpty()
  provider: ProviderType;

  @ApiProperty({
    description: 'Login credentials based on provider type',
    oneOf: [
      { $ref: getSchemaPath(LoginOtpDto) },
      { $ref: getSchemaPath(LoginTruecallerDto) },
      { $ref: getSchemaPath(LoginGoogleDto) },
    ],
  })
  credentials: LoginOtpDto | LoginTruecallerDto | LoginGoogleDto;
}
