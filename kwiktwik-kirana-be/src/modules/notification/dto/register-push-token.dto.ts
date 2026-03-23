import { IsString, IsOptional } from 'class-validator';

export interface RegisterPushTokenDto {
  token: string;
  appId: string;
  deviceModel?: string;
  osVersion?: string;
}

export class DeletePushTokenDto {
  @IsString()
  token: string;

  @IsString()
  appId: string;
}
