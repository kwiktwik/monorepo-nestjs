import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as Mixpanel from 'mixpanel';
import { DeviceSessionService } from '../device-session/device-session.service';

export interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEventInput {
  eventName: string;
  userData: UserData;
  eventProperties?: EventProperties;
  facebookCustomData?: EventProperties;
  appId: string;
  deduplicationId?: string;
}

export interface AnalyticsResult {
  provider: string;
  success: boolean;
  error?: string;
}

export interface AnalyticsResponse {
  overallSuccess: boolean;
  results: AnalyticsResult[];
}

const ACTIVE_APPS = ['com.paymentalert.app', 'com.sharekaro.kirana'] as const;
export type ActiveAppId = (typeof ACTIVE_APPS)[number];

const CONFIG = {
  facebook: {
    baseUrl: 'https://graph.facebook.com/v25.0',
    apiVersion: 'v25.0',
    actionSource: 'SYSTEM_GENERATED',
    defaultCurrency: 'INR',
  },
  firebase: {
    baseUrl: 'https://www.google-analytics.com/mp/collect',
  },
  blockedFacebookKeys: [
    'status',
    'event',
    'password',
    'passwd',
    'secret',
    'token',
    'credit_card',
    'cc_number',
    'card_number',
    'cvv',
    'ssn',
    'health',
    'medical',
    'dob',
    'date_of_birth',
    'pan',
    'aadhaar',
  ] as const,
};

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);
  private mixpanelInstances: Map<string, Mixpanel.Mixpanel> = new Map();

  constructor(
    private configService: ConfigService,
    private deviceSessionService: DeviceSessionService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initMixpanel();
  }

  private async initMixpanel(): Promise<void> {
    for (const appId of ACTIVE_APPS) {
      const normalizedAppId = this.normalizeAppId(appId);
      const token = this.configService.get<string>(
        `MIXPANEL_TOKEN_${normalizedAppId}`,
      );
      if (token) {
        try {
          this.mixpanelInstances.set(appId, Mixpanel.init(token));
        } catch (error) {
          this.logger.error(`Failed to init Mixpanel for ${appId}`, error);
        }
      }
    }
  }

  private normalizeAppId(appId: string): string {
    return appId.replace(/\./g, '_').toUpperCase();
  }

  private getCredentials(
    appId: string,
    keys: string[],
  ): Record<string, string> {
    const normalizedAppId = this.normalizeAppId(appId);
    const credentials: Record<string, string> = {};

    for (const key of keys) {
      const value = this.configService.get<string>(`${key}_${normalizedAppId}`);
      if (value) {
        credentials[key.toLowerCase()] = value;
      }
    }

    return credentials;
  }

  private validateInput(input: AnalyticsEventInput): void {
    if (!input.eventName?.trim()) {
      throw new Error('eventName is required');
    }
    if (!ACTIVE_APPS.includes(input.appId as ActiveAppId)) {
      throw new Error(
        `Invalid appId: ${input.appId}. Allowed: ${ACTIVE_APPS.join(', ')}`,
      );
    }
  }

  async sendEvent(input: AnalyticsEventInput): Promise<AnalyticsResponse> {
    this.validateInput(input);

    const {
      eventName,
      userData,
      eventProperties,
      facebookCustomData,
      appId,
      deduplicationId,
    } = input;

    const [facebookResult, mixpanelResult, firebaseResult] =
      await Promise.allSettled([
        this.sendFacebookEvent(
          eventName,
          userData,
          facebookCustomData || eventProperties,
          appId,
          deduplicationId,
        ),
        this.sendMixpanelEvent(
          eventName,
          userData,
          eventProperties,
          appId,
          deduplicationId,
        ),
        this.sendFirebaseEvent(eventName, userData, eventProperties, appId),
      ]);

    const results: AnalyticsResult[] = [
      this.mapResult('Facebook', facebookResult),
      this.mapResult('Mixpanel', mixpanelResult),
      this.mapResult('Firebase', firebaseResult),
    ];

    return { overallSuccess: results.some((r) => r.success), results };
  }

  private mapResult(
    provider: string,
    result: PromiseSettledResult<boolean>,
  ): AnalyticsResult {
    if (result.status === 'fulfilled') {
      return { provider, success: result.value };
    }
    return { provider, success: false, error: result.reason?.message };
  }

  private async sendFacebookEvent(
    eventName: string,
    userData: UserData,
    customData: EventProperties | undefined,
    appId: string,
    eventId?: string,
  ): Promise<boolean> {
    try {
      const credentials = this.getCredentials(appId, [
        'FACEBOOK_PIXEL_ID',
        'FACEBOOK_ACCESS_TOKEN',
        'FACEBOOK_APP_ID',
      ]);

      const pixelId = credentials.pixelid;
      const accessToken = credentials.accesstoken;
      const fbAppId = credentials.appid;

      if (!pixelId || !accessToken) {
        this.logger.warn(
          `Facebook Pixel ID or access token not configured for app: ${appId}`,
        );
        return false;
      }

      const sanitizedData = this.sanitizeFacebookData(customData || {});

      if (
        sanitizedData.amount !== undefined &&
        sanitizedData.value === undefined
      ) {
        const numValue = Number(sanitizedData.amount);
        if (numValue > 0) sanitizedData.value = numValue;
      }
      if (sanitizedData.value !== undefined && !sanitizedData.currency) {
        sanitizedData.currency = CONFIG.facebook.defaultCurrency;
      }

      // Unified Conversions API - single call for both web and app events
      return await this.sendToConversionsApi(
        eventName,
        userData,
        sanitizedData,
        pixelId,
        accessToken,
        fbAppId,
        eventId,
        appId,
      );
    } catch (error) {
      this.logger.error('Facebook analytics error', error);
      return false;
    }
  }

  private async sendToConversionsApi(
    eventName: string,
    userData: UserData,
    customData: EventProperties,
    pixelId: string,
    accessToken: string,
    fbAppId?: string,
    eventId?: string,
    appId?: string,
  ): Promise<boolean> {
    try {
      const url = `${CONFIG.facebook.baseUrl}/${pixelId}/events?access_token=${accessToken}`;

      // Get device data if userId is available
      let deviceData: {
        deviceModel: string | null;
        osVersion: string | null;
        appVersion: string | null;
        locale: string | null;
        timezone: string | null;
      } | null = null;
      if (userData.userId) {
        try {
          deviceData = await this.deviceSessionService.getLatestForUser(
            userData.userId,
          );
        } catch (e) {
          this.logger.warn(
            `Failed to get device data for user ${userData.userId}`,
            e,
          );
        }
      }

      const eventPayload: any = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: fbAppId ? 'app' : CONFIG.facebook.actionSource,
        user_data: this.buildFacebookUserData(userData),
        custom_data: customData,
      };

      // For app events, add app_data with required fields
      // Use device data if available, otherwise use defaults
      if (fbAppId) {
        eventPayload.app_data = {
          advertiser_tracking_enabled: 1,
          application_tracking_enabled: 1,
          extinfo: [
            'a2', // 0: version (a2=Android, i2=iOS)
            appId || 'com.kiranaapps.app', // 1: package name
            deviceData?.appVersion || '1.0', // 2: short version
            deviceData?.appVersion || '1.0.0', // 3: long version
            deviceData?.osVersion || '14.0', // 4: OS version
            deviceData?.deviceModel || 'Unknown', // 5: device model
            deviceData?.locale || 'en_IN', // 6: locale
            'IST', // 7: timezone abbreviation
            'Unknown', // 8: carrier
            'Unknown', // 9: screen width
            'Unknown', // 10: screen height
            'Unknown', // 11: screen density
            'Unknown', // 12: CPU cores
            'Unknown', // 13: total disk space
            'Unknown', // 14: free disk space
            deviceData?.timezone || 'Asia/Kolkata', // 15: device timezone
          ],
        };
      }

      const payload = {
        data: [eventPayload],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        this.logger.error(
          `Facebook Conversions API error: ${response.status}`,
          result,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Facebook Conversions API error', error);
      return false;
    }
  }

  private sanitizeFacebookData(data: EventProperties): EventProperties {
    const sanitized: EventProperties = {};
    for (const [key, value] of Object.entries(data)) {
      if (
        !CONFIG.blockedFacebookKeys.includes(
          key.toLowerCase() as (typeof CONFIG.blockedFacebookKeys)[number],
        )
      ) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private buildFacebookUserData(userData: UserData): Record<string, string> {
    const hashed: Record<string, string> = {};
    if (userData.email) hashed.em = this.hashData(userData.email);
    if (userData.phone) hashed.ph = this.hashData(userData.phone);
    if (userData.firstName) hashed.fn = this.hashData(userData.firstName);
    if (userData.lastName) hashed.ln = this.hashData(userData.lastName);
    if (userData.ip) hashed.client_ip_address = userData.ip;
    if (userData.userAgent) hashed.client_user_agent = userData.userAgent;
    return hashed;
  }

  private buildUserProperties(userData: UserData): Record<string, string> {
    const props: Record<string, string> = {};
    if (userData.email) props.$email = userData.email;
    if (userData.phone) props.$phone = userData.phone;
    if (userData.firstName) props.$first_name = userData.firstName;
    if (userData.lastName) props.$last_name = userData.lastName;
    return props;
  }

  private hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data.toLowerCase().trim())
      .digest('hex');
  }

  private async sendMixpanelEvent(
    eventName: string,
    userData: UserData,
    properties: EventProperties | undefined,
    appId: string,
    deduplicationId?: string,
  ): Promise<boolean> {
    try {
      const mixpanel = this.mixpanelInstances.get(appId);

      if (!mixpanel) {
        this.logger.warn(`Mixpanel not configured for app: ${appId}`);
        return false;
      }

      const distinctId =
        userData.userId || userData.email || userData.phone || 'anonymous';
      const eventProps: Record<string, string | number | boolean> = {
        distinct_id: distinctId,
      };

      if (deduplicationId) eventProps.$insert_id = deduplicationId;

      Object.entries(properties || {}).forEach(([key, value]) => {
        if (value !== undefined) eventProps[key] = value;
      });

      mixpanel.track(eventName, eventProps);

      const userProps = this.buildUserProperties(userData);
      if (Object.keys(userProps).length > 0) {
        try {
          mixpanel.people.set(distinctId, userProps);
        } catch (error) {
          this.logger.warn('Failed to set user properties', error);
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Mixpanel error', error);
      return false;
    }
  }

  private async sendFirebaseEvent(
    eventName: string,
    userData: UserData,
    eventParameters: EventProperties | undefined,
    appId: string,
  ): Promise<boolean> {
    try {
      const credentials = this.getCredentials(appId, [
        'FIREBASE_MEASUREMENT_ID',
        'FIREBASE_API_SECRET',
      ]);

      if (!credentials.measurementid || !credentials.apisecret) {
        this.logger.warn(
          `Firebase credentials not configured for app: ${appId}`,
        );
        return false;
      }

      const clientId =
        userData.userId ||
        userData.email ||
        userData.phone ||
        crypto.randomUUID();
      const params: Record<string, string | number | boolean> = {};

      Object.entries(eventParameters || {}).forEach(([key, value]) => {
        if (value !== undefined) params[key] = value;
      });

      const userProps = this.buildUserProperties(userData);
      Object.assign(params, userProps);

      const payload = {
        client_id: clientId,
        user_id: userData.userId,
        events: [{ name: eventName, params }],
      };

      const url = `${CONFIG.firebase.baseUrl}?measurement_id=${credentials.measurementid}&api_secret=${credentials.apisecret}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status !== 204) {
        this.logger.error(`Firebase API error: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Firebase error', error);
      return false;
    }
  }
}
