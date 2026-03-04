export interface RegisterPushTokenDto {
  token: string;
  appId: string;
  deviceModel?: string;
  osVersion?: string;
}

export interface DeletePushTokenDto {
  token: string;
  appId: string;
}
