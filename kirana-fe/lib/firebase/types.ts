// Firebase decoded token types
export interface FirebaseIdentities {
  "google.com"?: string[];
  email: string[];
}

export interface FirebaseProvider {
  identities: FirebaseIdentities;
  sign_in_provider: string;
}

export interface CustomClaims {
  dbUserId: string;
  role: string;
  createdAt: string;
}

export interface DecodedFirebaseToken {
  // User information
  name: string;
  picture: string;
  email: string;
  email_verified: boolean;

  // Firebase specific fields
  iss: string; // issuer
  aud: string; // audience
  auth_time: number; // authentication time
  user_id: string;
  sub: string; // subject
  iat: number; // issued at
  exp: number; // expiration time
  uid: string;

  // Firebase provider information
  firebase: FirebaseProvider;

  // Custom claims (set by our application)
  dbUserId?: string;
  role?: string;
  createdAt?: string;
}

// Type for the full Firebase Admin UserRecord
export interface FirebaseUserRecord {
  uid: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  disabled: boolean;
  metadata: {
    lastSignInTime?: string;
    creationTime?: string;
    lastRefreshTime?: string;
  };
  customClaims?: Record<string, any>;
  providerData: Array<{
    uid: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId: string;
  }>;
  passwordHash?: string;
  passwordSalt?: string;
  tokensValidAfterTime?: string;
  tenantId?: string;
}

// Auth response types
export interface FirebaseAuthResponse {
  success: boolean;
  user: DecodedFirebaseToken;
  tokenType: "id_token" | "custom_token_exchanged" | "custom_token_mock";
  decodedToken: DecodedFirebaseToken;
  note?: string;
}

export interface FirebaseAuthError {
  error: string;
}

// Simplified user type for authentication
export interface AuthenticatedFirebaseUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
  dbUserId?: string;
  role?: string;
  createdAt?: string;
}

