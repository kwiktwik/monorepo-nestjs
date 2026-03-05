import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { AuthUserResponse } from './types';
export type { AuthUserResponse } from './types';
import { isMockMode } from '../../common/utils/is-mock-mode';

interface TruecallerTokenData {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface TruecallerUserInfo {
  sub?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  phone_number_country_code?: string;
  email?: string;
  picture?: string;
  gender?: string;
  address?: Record<string, unknown>;
  error?: string;
  error_description?: string;
}

/** Normalize phone to E.164 for consistent storage/lookup (e.g. +918855966494) */
function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  /** Test phone for local dev - use OTP 123456 without sending SMS */
  private static readonly TEST_PHONE = '+919999999999';
  private static readonly TEST_OTP = '123456';

  /**
   * Send OTP to phone number with abuse prevention
   */
  async sendOtp(
    phoneNumber: string,
    appHash: string | undefined,
    ipAddress: string,
  ): Promise<{ message: string; retryAfter?: number; mockCode?: string }> {
    const normalized = normalizePhoneNumber(phoneNumber);

    // TEST MODE: Skip SMS for test number
    if (normalized === AuthService.TEST_PHONE) {
      return { message: 'OTP sent successfully (test mode - use 123456)', mockCode: AuthService.TEST_OTP };
    }

    // Cleanup old OTPs (older than 24 hours)
    await this.db
      .delete(schema.otpCodes)
      .where(sql`${schema.otpCodes.createdAt} < NOW() - INTERVAL '24 hours'`);

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await this.db.insert(schema.otpCodes).values({
      phoneNumber: normalized,
      codeHash,
      ipAddress,
      expiresAt,
    });

    // Send SMS via Equence API (skip in mock mode)
    if (isMockMode()) {
      this.logger.log(`[MOCK SMS] OTP for ${normalized} is: ${code}`);
      return { message: 'OTP sent successfully (mock mode)', mockCode: code };
    }

    await this.sendSms(normalized, code, appHash);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Send SMS via Equence API
   */
  private async sendSms(
    phoneNumber: string,
    code: string,
    appHash?: string,
  ): Promise<void> {
    const username = process.env.EQUENCE_USERNAME;
    const password = process.env.EQUENCE_PASSWORD;
    const from = process.env.EQUENCE_SENDER_ID || 'ALRTSN';
    const tmplId = process.env.EQUENCE_TMPL_ID || '1707176553065211775';

    if (!username || !password) {
      throw new InternalServerErrorException(
        'Equence SMS credentials not configured',
      );
    }

    // Format phone number (remove + and ensure proper format)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    const text = appHash
      ? `${code} is your Alert Soundbox OTP for login. Do not share it with anyone.\n ${appHash}`
      : `${code} is your Alert Soundbox OTP for login. Do not share it with anyone.`;

    const payload = {
      username,
      password,
      to: formattedPhone,
      from,
      tmplId,
      text,
    };

    try {
      const response = await fetch('https://api.equence.in/pushsms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `Equence API error (${response.status}): ${errorText}`,
        );
      }

      type EquenceResponse = {
        errorCode?: string;
        message?: string;
        response?: Array<{ status?: string }>;
      };

      const result = (await response.json()) as EquenceResponse;
      if (result.errorCode) {
        throw new InternalServerErrorException(
          `Equence API error: ${result.message || 'Unknown error'} (Code: ${result.errorCode})`,
        );
      }

      if (
        result.response &&
        Array.isArray(result.response) &&
        result.response[0]?.status === 'failed'
      ) {
        throw new InternalServerErrorException('Failed to send SMS');
      }
    } catch (error) {
      this.logger.error('[SMS] Error sending OTP:', error);
      throw new InternalServerErrorException(
        `Failed to send OTP: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Verify OTP and return JWT token
   */
  async verifyOtp(
    phoneNumber: string,
    code: string,
    appId: string,
  ): Promise<{ token: string; user: AuthUserResponse }> {
    const normalized = normalizePhoneNumber(phoneNumber);

    // TEST MODE: Bypass for test credentials
    if (
      normalized === AuthService.TEST_PHONE &&
      code === AuthService.TEST_OTP
    ) {
      return this.verifyTestOtp(appId);
    }

    // Find most recent non-verified OTP for this phone number
    const otpRecords = await this.db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.phoneNumber, normalized),
          eq(schema.otpCodes.verified, false),
        ),
      )
      .orderBy(sql`${schema.otpCodes.createdAt} DESC`)
      .limit(1);

    if (otpRecords.length === 0) {
      // Check if a recent OTP exists but was already verified
      const anyOtp = await this.db
        .select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.phoneNumber, normalized))
        .orderBy(sql`${schema.otpCodes.createdAt} DESC`)
        .limit(1);
      if (anyOtp.length > 0 && anyOtp[0].verified) {
        throw new UnauthorizedException(
          'This OTP was already used. Request a new OTP to sign in again.',
        );
      }
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const otpRecord = otpRecords[0];

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= 5) {
      throw new UnauthorizedException(
        'Too many failed attempts. Please request a new OTP',
      );
    }

    // Verify the code
    const isValid = await bcrypt.compare(code, otpRecord.codeHash);

    if (!isValid) {
      // Increment attempts
      await this.db
        .update(schema.otpCodes)
        .set({ attempts: otpRecord.attempts + 1 })
        .where(eq(schema.otpCodes.id, otpRecord.id));

      throw new UnauthorizedException('Invalid OTP code');
    }

    // Mark OTP as verified
    await this.db
      .update(schema.otpCodes)
      .set({ verified: true })
      .where(eq(schema.otpCodes.id, otpRecord.id));

    // Find or create user
    let userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, normalized))
      .limit(1);

    let userId: string;

    if (userRecord.length === 0) {
      // Create new user
      const cleanPhone = normalized.replace(/\D/g, '');
      const tempEmail = `${cleanPhone}@alertpay.local`;
      const tempName = `User ${cleanPhone.slice(-4)}`;

      userId = nanoid();
      await this.db.insert(schema.user).values({
        id: userId,
        name: tempName,
        email: tempEmail,
        emailVerified: false,
        phoneNumber: normalized,
        phoneNumberVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create user metadata for this app
      await this.db.insert(schema.userMetadata).values({
        userId,
        appId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRecord = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);
    } else {
      userId = userRecord[0].id;

      // Update phone number verification
      await this.db
        .update(schema.user)
        .set({
          phoneNumber: normalized,
          phoneNumberVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, userId));

      // Check if user metadata exists for this app
      const metadata = await this.db
        .select()
        .from(schema.userMetadata)
        .where(
          and(
            eq(schema.userMetadata.userId, userId),
            eq(schema.userMetadata.appId, appId),
          ),
        )
        .limit(1);

      if (metadata.length === 0) {
        await this.db.insert(schema.userMetadata).values({
          userId,
          appId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: userId,
      appId,
    });

    return {
      token,
      user: {
        id: userId,
        name: userRecord[0].name,
        email: userRecord[0].email,
        phoneNumber: normalized,
        phoneNumberVerified: true,
      },
    };
  }

  /** Test mode: find or create user for +919999999999 and return token */
  private async verifyTestOtp(
    appId: string,
  ): Promise<{ token: string; user: AuthUserResponse }> {
    const normalized = AuthService.TEST_PHONE;
    const cleanPhone = normalized.replace(/\D/g, '');
    const tempEmail = `${cleanPhone}@alertpay.local`;
    const tempName = `User ${cleanPhone.slice(-4)}`;

    let userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, normalized))
      .limit(1);

    let userId: string;

    if (userRecord.length === 0) {
      userId = nanoid();
      await this.db.insert(schema.user).values({
        id: userId,
        name: tempName,
        email: tempEmail,
        emailVerified: false,
        phoneNumber: normalized,
        phoneNumberVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.db.insert(schema.userMetadata).values({
        userId,
        appId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userRecord = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);
    } else {
      userId = userRecord[0].id;
      const metadata = await this.db
        .select()
        .from(schema.userMetadata)
        .where(
          and(
            eq(schema.userMetadata.userId, userId),
            eq(schema.userMetadata.appId, appId),
          ),
        )
        .limit(1);
      if (metadata.length === 0) {
        await this.db.insert(schema.userMetadata).values({
          userId,
          appId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const token = this.jwtService.sign({ sub: userId, appId });
    return {
      token,
      user: {
        id: userId,
        name: userRecord[0].name,
        email: userRecord[0].email,
        phoneNumber: normalized,
        phoneNumberVerified: true,
      },
    };
  }

  /** Mock mode: return a hardcoded Truecaller test user without real OAuth */
  private async mockTruecallerSignin(appId: string) {
    const normalized = '+919999999998';
    const cleanPhone = normalized.replace(/\D/g, '');
    const tempEmail = `${cleanPhone}@alertpay.local`;
    const tempName = 'Test Truecaller User';

    let userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, normalized))
      .limit(1);

    let userId: string;

    if (userRecord.length === 0) {
      userId = nanoid();
      await this.db.insert(schema.user).values({
        id: userId,
        name: tempName,
        email: tempEmail,
        emailVerified: false,
        phoneNumber: normalized,
        phoneNumberVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.db.insert(schema.userMetadata).values({
        userId,
        appId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userRecord = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);
    } else {
      userId = userRecord[0].id;
      const metadata = await this.db
        .select()
        .from(schema.userMetadata)
        .where(and(eq(schema.userMetadata.userId, userId), eq(schema.userMetadata.appId, appId)))
        .limit(1);
      if (metadata.length === 0) {
        await this.db.insert(schema.userMetadata).values({ userId, appId, createdAt: new Date(), updatedAt: new Date() });
      }
    }

    // Upsert mock Truecaller account row (with appId for uniqueness)
    const existingMockAccounts = await this.db
      .select()
      .from(schema.account)
      .where(
        and(
          eq(schema.account.userId, userId),
          eq(schema.account.providerId, 'truecaller'),
          eq(schema.account.appId, appId),
        ),
      )
      .limit(1);

    if (existingMockAccounts.length === 0) {
      await this.db.insert(schema.account).values({
        id: nanoid(),
        accountId: 'mock_truecaller_sub',
        providerId: 'truecaller',
        userId,
        appId,
        idToken: 'mock_truecaller_sub',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const token = this.jwtService.sign({ sub: userId, appId });
    const userProfile = {
      sub: 'mock_truecaller_sub',
      given_name: 'Test',
      family_name: 'Truecaller',
      phone_number: normalized,
      phone_number_verified: true,
      phone_number_country_code: '91',
      email: tempEmail,
    };

    return {
      token,
      user: {
        id: userId,
        name: userRecord[0].name,
        email: userRecord[0].email,
        phoneNumber: normalized,
        phoneNumberVerified: true,
      },
      userProfile,
    };
  }

  /**
   * Truecaller Sign-In: Exchange authorization code for user data and return JWT
   */
  async truecallerSignin(
    code: string,
    codeVerifier: string,
    clientId: string,
    appId: string,
  ): Promise<{
    token: string;
    user: AuthUserResponse;
    userProfile: {
      sub?: string;
      given_name?: string;
      family_name?: string;
      phone_number?: string;
      email?: string;
      picture?: string;
      gender?: string;
      phone_number_country_code?: string;
      phone_number_verified?: boolean;
      address?: Record<string, unknown>;
    };
  }> {
    // MOCK MODE: Skip real Truecaller OAuth, return hardcoded test user
    if (isMockMode()) {
      this.logger.log(`[MOCK Truecaller] Returning hardcoded test user for app=${appId}`);
      return this.mockTruecallerSignin(appId);
    }

    // Step 1: Exchange authorization code for access token
    this.logger.log(`[Truecaller Token] App ID: ${appId}`);

    const tokenResponse = await fetch(
      'https://oauth-account-noneu.truecaller.com/v1/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          code_verifier: codeVerifier,
        }).toString(),
      },
    );

    const tokenData = (await tokenResponse.json()) as TruecallerTokenData;

    if (!tokenResponse.ok) {
      this.logger.error(
        '[Truecaller Token] Exchange failed:',
        tokenResponse.status,
        tokenData,
      );
      throw new UnauthorizedException(
        tokenData.error_description ||
        tokenData.error ||
        `Truecaller token exchange failed (${tokenResponse.status})`,
      );
    }

    const { access_token, expires_in } = tokenData;

    if (!access_token) {
      throw new UnauthorizedException(
        'No access token received from Truecaller',
      );
    }

    // Step 2: Fetch user profile via OIDC userinfo endpoint
    const userInfoResponse = await fetch(
      'https://oauth-account-noneu.truecaller.com/v1/userinfo',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const userInfoData = (await userInfoResponse.json()) as TruecallerUserInfo;

    if (!userInfoResponse.ok) {
      this.logger.error(
        '[Truecaller UserInfo] Fetch failed:',
        userInfoResponse.status,
        userInfoData,
      );
      throw new UnauthorizedException(
        userInfoData.error_description ||
        userInfoData.error ||
        `Truecaller profile fetch failed (${userInfoResponse.status})`,
      );
    }

    this.logger.log('[Truecaller UserInfo] Profile received:', {
      sub: userInfoData.sub,
      phone_number: userInfoData.phone_number,
      given_name: userInfoData.given_name,
    });

    // Step 3: Extract user profile fields (matching OIDC claims)
    const phoneNumber = userInfoData.phone_number;
    const userEmail =
      userInfoData.email ||
      `${phoneNumber?.replace(/\D/g, '') || 'unknown'}@alertpay.local`;
    const userName =
      (userInfoData.given_name && userInfoData.family_name
        ? `${userInfoData.given_name} ${userInfoData.family_name}`
        : userInfoData.given_name || userInfoData.family_name) ||
      `User ${phoneNumber?.slice(-4) || 'Unknown'}`;

    if (!phoneNumber) {
      this.logger.error(
        '[Truecaller UserInfo] No phone_number in response:',
        userInfoData,
      );
      throw new UnauthorizedException('No phone number in Truecaller profile');
    }

    const normalized = normalizePhoneNumber(phoneNumber);

    // Build userProfile object similar to Next.js implementation
    const userProfile = {
      sub: userInfoData.sub,
      given_name: userInfoData.given_name,
      family_name: userInfoData.family_name,
      phone_number: userInfoData.phone_number,
      email: userInfoData.email,
      picture: userInfoData.picture,
      gender: userInfoData.gender,
      phone_number_country_code: userInfoData.phone_number_country_code,
      phone_number_verified: userInfoData.phone_number_verified,
      address: userInfoData.address,
    };

    // Step 4: Find or create user
    let userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, normalized))
      .limit(1);

    let userId: string;

    if (userRecord.length === 0) {
      this.logger.log(
        `[Truecaller UserInfo] Creating new user for app ${appId}`,
      );
      userId = nanoid();
      await this.db.insert(schema.user).values({
        id: userId,
        name: userName,
        email: userEmail,
        emailVerified: !!userInfoData.email,
        phoneNumber: normalized,
        phoneNumberVerified: userInfoData.phone_number_verified ?? true,
        image: userInfoData.picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.db.insert(schema.userMetadata).values({
        userId,
        appId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRecord = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);
    } else {
      userId = userRecord[0].id;
      this.logger.log(
        `[Truecaller UserInfo] Found existing user ${userId} for app ${appId}`,
      );

      await this.db
        .update(schema.user)
        .set({
          name: userName,
          image: userInfoData.picture || userRecord[0].image,
          emailVerified: userInfoData.email
            ? true
            : userRecord[0].emailVerified,
          phoneNumber: normalized,
          phoneNumberVerified:
            userInfoData.phone_number_verified ??
            userRecord[0].phoneNumberVerified,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, userId));

      // Ensure user metadata exists for this app
      const metadata = await this.db
        .select()
        .from(schema.userMetadata)
        .where(
          and(
            eq(schema.userMetadata.userId, userId),
            eq(schema.userMetadata.appId, appId),
          ),
        )
        .limit(1);

      if (metadata.length === 0) {
        await this.db.insert(schema.userMetadata).values({
          userId,
          appId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Step 5: Create or update Truecaller account link (scoped per appId)
    const existingAccounts = await this.db
      .select()
      .from(schema.account)
      .where(
        and(
          eq(schema.account.userId, userId),
          eq(schema.account.providerId, 'truecaller'),
          eq(schema.account.appId, appId),
        ),
      )
      .limit(1);

    if (existingAccounts.length > 0) {
      await this.db
        .update(schema.account)
        .set({
          accessToken: access_token,
          idToken: userInfoData.sub,
          accessTokenExpiresAt: new Date(
            Date.now() + (expires_in ?? 3600) * 1000,
          ),
          updatedAt: new Date(),
        })
        .where(eq(schema.account.id, existingAccounts[0].id));
    } else {
      await this.db.insert(schema.account).values({
        id: nanoid(),
        accountId: userInfoData.sub || phoneNumber,
        providerId: 'truecaller',
        userId,
        appId,
        accessToken: access_token,
        idToken: userInfoData.sub,
        accessTokenExpiresAt: new Date(
          Date.now() + (expires_in ?? 3600) * 1000,
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Step 6: Generate JWT token
    const token = this.jwtService.sign({
      sub: userId,
      appId,
    });

    return {
      token,
      user: {
        id: userId,
        name: userRecord[0].name,
        email: userRecord[0].email,
        phoneNumber: normalized,
        phoneNumberVerified: true,
        image: userRecord[0].image ?? undefined,
      },
      userProfile,
    };
  }

  /**
   * Google Sign-In: Verify ID token and return JWT
   */
  async googleSignin(
    idToken: string,
    appId: string,
  ): Promise<{ token: string; user: AuthUserResponse }> {
    if (!this.googleClient) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    try {
      // Verify the Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { email, name, picture } = payload;

      // Find or create user
      let userRecord = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);

      let userId: string;

      if (userRecord.length === 0) {
        // Create new user
        userId = nanoid();
        await this.db.insert(schema.user).values({
          id: userId,
          name: name || 'User',
          email,
          emailVerified: true,
          image: picture,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create Google account record (scoped per appId)
        await this.db.insert(schema.account).values({
          id: nanoid(),
          accountId: payload.sub || email,
          providerId: 'google',
          userId,
          appId,
          idToken: payload.sub,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create user metadata for this app
        await this.db.insert(schema.userMetadata).values({
          userId,
          appId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        userRecord = await this.db
          .select()
          .from(schema.user)
          .where(eq(schema.user.id, userId))
          .limit(1);
      } else {
        userId = userRecord[0].id;

        // Update user info
        await this.db
          .update(schema.user)
          .set({
            name: name || userRecord[0].name,
            image: picture || userRecord[0].image,
            emailVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.user.id, userId));

        // Upsert Google account row (refresh idToken, scoped per appId)
        const existingGoogleAccount = await this.db
          .select()
          .from(schema.account)
          .where(
            and(
              eq(schema.account.userId, userId),
              eq(schema.account.providerId, 'google'),
              eq(schema.account.appId, appId),
            ),
          )
          .limit(1);

        if (existingGoogleAccount.length === 0) {
          await this.db.insert(schema.account).values({
            id: nanoid(),
            accountId: payload.sub || email,
            providerId: 'google',
            userId,
            appId,
            idToken: payload.sub,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await this.db
            .update(schema.account)
            .set({ idToken: payload.sub, updatedAt: new Date() })
            .where(eq(schema.account.id, existingGoogleAccount[0].id));
        }

        // Check if user metadata exists for this app
        const metadata = await this.db
          .select()
          .from(schema.userMetadata)
          .where(
            and(
              eq(schema.userMetadata.userId, userId),
              eq(schema.userMetadata.appId, appId),
            ),
          )
          .limit(1);

        if (metadata.length === 0) {
          await this.db.insert(schema.userMetadata).values({
            userId,
            appId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: userId,
        appId,
      });

      return {
        token,
        user: {
          id: userId,
          name: userRecord[0].name,
          email: userRecord[0].email,
          emailVerified: true,
          image: userRecord[0].image ?? undefined,
        },
      };
    } catch (error) {
      this.logger.error('[Google Sign-In] Error:', error);
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }
}
