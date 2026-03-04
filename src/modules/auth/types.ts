export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  emailVerified?: boolean;
  image?: string;
}
