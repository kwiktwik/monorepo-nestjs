import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  StandardCheckoutClient,
  Env,
  CreateSdkOrderRequest,
} from 'pg-sdk-node';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nanoid } from 'nanoid';

export type PaymentModeType =
  | 'UPI_INTENT'
  | 'UPI_COLLECT'
  | 'UPI_QR'
  | 'NET_BANKING'
  | 'CARD'
  | 'WALLET'
  | 'PHONEPE_WALLET'
  | 'PAY_PAGE';

export interface PaymentModeConfig {
  type?: PaymentModeType;
  vpa?: string;
  phoneNumber?: string;
  cardTypes?: ('DEBIT_CARD' | 'CREDIT_CARD')[];
}

interface PhonePeCredentials {
  clientId: string;
  clientSecret: string;
  clientVersion: number;
  merchantId: string;
  saltKey?: string;
  saltIndex: number;
  env: 'SANDBOX' | 'PRODUCTION';
}

interface PhonePeClientConfig {
  client: StandardCheckoutClient;
  credentials: PhonePeCredentials;
}

export interface PhonePeAuthTokenResponse {
  access_token: string;
  expires_at: number;
  token_type?: string;
  scope?: string;
  [key: string]: unknown;
}

@Injectable()
export class PhonePeService {
  private readonly logger = new Logger(PhonePeService.name);
  private phonePeClients: Map<string, PhonePeClientConfig> = new Map();
  private tokenCache: Record<
    string,
    { token: PhonePeAuthTokenResponse; expiresAt: number }
  > = {};

  constructor(
    private config: ConfigService,
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  private normalizeAppId(appId: string): string {
    return appId.replace(/\./g, '_').toUpperCase();
  }

  private getCredentials(appId: string): PhonePeCredentials {
    if (!appId) {
      throw new InternalServerErrorException(
        'App ID is required. Please provide X-App-ID header.',
      );
    }

    const normalizedAppId = this.normalizeAppId(appId);

    const appSpecificEnv = this.config.get<string>(
      `PHONEPE_ENV_${normalizedAppId}`,
    );
    const globalEnv = this.config.get<string>('PHONEPE_ENV');
    const env = (appSpecificEnv || globalEnv || 'SANDBOX') as
      | 'SANDBOX'
      | 'PRODUCTION';
    const isProd = env === 'PRODUCTION';

    const clientId = this.config.get<string>(
      `PHONEPE_CLIENT_ID_${normalizedAppId}`,
    );
    const clientSecret = this.config.get<string>(
      `PHONEPE_CLIENT_SECRET_${normalizedAppId}`,
    );
    const merchantId =
      this.config.get<string>(`PHONEPE_MERCHANT_ID_${normalizedAppId}`) ||
      (isProd ? '' : 'PGTESTPAYUAT');
    const saltKey = this.config.get<string>(
      `PHONEPE_SALT_KEY_${normalizedAppId}`,
    );
    const saltIndex =
      parseInt(
        this.config.get<string>(`PHONEPE_SALT_INDEX_${normalizedAppId}`) || '1',
        10,
      ) || 1;
    const clientVersion =
      parseInt(
        this.config.get<string>(`PHONEPE_CLIENT_VERSION_${normalizedAppId}`) ||
          this.config.get<string>('PHONEPE_CLIENT_VERSION') ||
          '1',
        10,
      ) || 1;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        `PhonePe credentials not found for app: ${appId}. Please set PHONEPE_CLIENT_ID_${normalizedAppId} and PHONEPE_CLIENT_SECRET_${normalizedAppId} environment variables.`,
      );
    }

    return {
      clientId,
      clientSecret,
      clientVersion,
      merchantId,
      saltKey,
      saltIndex,
      env,
    };
  }

  private getPhonePeClient(appId: string): PhonePeClientConfig {
    if (!this.phonePeClients.has(appId)) {
      const credentials = this.getCredentials(appId);
      const sdkEnv =
        credentials.env === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

      this.logger.log(
        `[PhonePe] Initializing ${credentials.env} client for app: ${appId}`,
      );
      this.logger.log(
        `[PhonePe] Client ID: ${credentials.clientId.substring(0, 10)}...`,
      );

      const client = StandardCheckoutClient.getInstance(
        credentials.clientId,
        credentials.clientSecret,
        credentials.clientVersion,
        sdkEnv,
      );

      this.phonePeClients.set(appId, { client, credentials });

      this.logger.log(
        `[PhonePe] Successfully initialized for ${credentials.env} environment`,
      );
    }

    return this.phonePeClients.get(appId)!;
  }

  private getCacheKey(appId: string): string {
    const credentials = this.getCredentials(appId);
    return `${appId}_${credentials.env}`;
  }

  private rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }

  async createOrder(
    userId: string,
    appId: string,
    dto: {
      amount: number;
      redirectUrl: string;
      disablePaymentRetry?: boolean;
      paymentMode?: PaymentModeConfig;
    },
  ) {
    const {
      amount,
      redirectUrl,
      disablePaymentRetry = false,
      paymentMode,
    } = dto;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Valid amount is required');
    }

    if (!redirectUrl) {
      throw new BadRequestException('redirectUrl is required');
    }

    const { client } = this.getPhonePeClient(appId);
    const amountInPaise = this.rupeesToPaise(amount);
    const merchantOrderId = nanoid(10);

    const order = await this.createLocalOrder(
      merchantOrderId,
      userId,
      appId,
      amountInPaise,
    );

    const modeType = paymentMode?.type || 'UPI_INTENT';

    const builder =
      modeType === 'PAY_PAGE'
        ? CreateSdkOrderRequest.StandardCheckoutBuilder()
        : CreateSdkOrderRequest.CustomCheckoutBuilder();

    builder
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl);

    if (
      disablePaymentRetry &&
      typeof builder === 'object' &&
      builder !== null &&
      'disablePaymentRetry' in builder
    ) {
      console.log(
        '[PhonePe] Builder type for disablePaymentRetry:',
        Object.keys(builder),
      );
      (
        builder as { disablePaymentRetry(v: boolean): unknown }
      ).disablePaymentRetry(true);
    }

    const request = (builder as { build(): CreateSdkOrderRequest }).build();

    try {
      const response = await client.createSdkOrder(request);
      this.logger.log(`[PhonePe] Order created: ${response.orderId}`);

      return {
        orderId: order.id,
        phonepeOrderId: response.orderId,
        state: response.state,
        expireAt: response.expireAt,
        token: response.token,
        paymentMode: { type: modeType },
      };
    } catch (error) {
      this.logger.error('[PhonePe] Create order failed:', error);
      throw new InternalServerErrorException(
        `Failed to create PhonePe order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async createOrderWithAuth(
    userId: string,
    appId: string,
    dto: {
      redirectUrl: string;
      disablePaymentRetry?: boolean;
      paymentMode?: PaymentModeConfig;
    },
  ) {
    const { redirectUrl, disablePaymentRetry = false, paymentMode } = dto;

    if (!redirectUrl) {
      throw new BadRequestException('redirectUrl is required');
    }

    const { client, credentials } = this.getPhonePeClient(appId);
    const amountInPaise = 500;
    const merchantOrderId = nanoid(10);

    const order = await this.createLocalOrder(
      merchantOrderId,
      userId,
      appId,
      amountInPaise,
    );

    const modeType = paymentMode?.type || 'UPI_INTENT';

    const builder: unknown =
      modeType === 'PAY_PAGE'
        ? CreateSdkOrderRequest.StandardCheckoutBuilder()
        : CreateSdkOrderRequest.CustomCheckoutBuilder();

    const builderWithMethods = builder as {
      merchantOrderId(n: string): typeof builderWithMethods;
      amount(n: number): typeof builderWithMethods;
      redirectUrl(n: string): typeof builderWithMethods;
      build(): CreateSdkOrderRequest;
    };
    builderWithMethods
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl);

    if (
      disablePaymentRetry &&
      typeof builder === 'object' &&
      builder !== null &&
      'disablePaymentRetry' in builder
    ) {
      console.log(
        '[PhonePe] Builder type for disablePaymentRetry:',
        Object.keys(builder),
      );
      (
        builder as { disablePaymentRetry(v: boolean): unknown }
      ).disablePaymentRetry(true);
    }

    const request = (builder as { build(): CreateSdkOrderRequest }).build();

    try {
      const [phonePeOrder, authTokenResponse] = await Promise.all([
        client.createSdkOrder(request),
        this.getAuthToken(appId),
      ]);

      this.logger.log(
        `[PhonePe] Order with auth created: ${phonePeOrder.orderId}`,
      );

      return {
        merchantOrderId,
        orderId: phonePeOrder.orderId,
        merchantId: credentials.merchantId,
        token: phonePeOrder.token,
        merchantSubscriptionId: null,
        paymentMode: { type: modeType },
        localOrderId: order.id,
        authToken: authTokenResponse,
      };
    } catch (error) {
      this.logger.error('[PhonePe] Create order with auth failed:', error);
      throw new InternalServerErrorException(
        `Failed to create PhonePe order with auth: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async initiatePayment(
    userId: string,
    appId: string,
    dto: {
      amount: number;
      redirectUrl: string;
      message?: string;
      metaInfo?: Record<string, string | undefined>;
    },
  ) {
    const { amount, redirectUrl, message = 'Payment', metaInfo } = dto;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Valid amount is required');
    }

    if (!redirectUrl) {
      throw new BadRequestException('redirectUrl is required');
    }

    const { client } = this.getPhonePeClient(appId);
    const amountInPaise = this.rupeesToPaise(amount);
    const merchantOrderId = nanoid(10);

    const order = await this.createLocalOrder(
      merchantOrderId,
      userId,
      appId,
      amountInPaise,
    );

    const builder = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl)
      .message(message);

    if (metaInfo) {
      console.log(
        '[PhonePe] metaInfo type:',
        typeof metaInfo,
        Object.keys(metaInfo),
      );
      (
        builder as { metaInfo(m: Record<string, unknown>): typeof builder }
      ).metaInfo(metaInfo);
    }

    const request = (builder as { build(): CreateSdkOrderRequest }).build();

    try {
      const response = await client.pay(request);
      this.logger.log(`[PhonePe] Payment initiated: ${merchantOrderId}`);

      return {
        orderId: order.id,
        redirectUrl: response.redirectUrl,
        merchantOrderId,
      };
    } catch (error) {
      this.logger.error('[PhonePe] Payment initiation failed:', error);
      throw new InternalServerErrorException(
        `Failed to initiate PhonePe payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async checkStatus(
    appId: string,
    merchantOrderId: string,
    type: 'standard' | 'mobile' = 'standard',
  ) {
    if (!merchantOrderId) {
      throw new BadRequestException('merchantOrderId is required');
    }

    try {
      if (type === 'mobile') {
        return await this.checkMobileStatus(appId, merchantOrderId);
      }

      const { client } = this.getPhonePeClient(appId);
      const response = await client.getOrderStatus(merchantOrderId);
      this.logger.log(
        `[PhonePe] Status checked: ${merchantOrderId} - ${response.state}`,
      );

      return {
        orderId: merchantOrderId,
        state: response.state,
        phonepeOrderId: response.orderId,
        amount: response.amount,
        transactionId: response.paymentDetails?.[0]?.transactionId,
        paymentMode: response.paymentDetails?.[0]?.paymentMode,
      };
    } catch (error) {
      this.logger.error('[PhonePe] Check status failed:', error);
      throw new InternalServerErrorException(
        `Failed to check PhonePe order status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async checkMobileStatus(appId: string, merchantOrderId: string) {
    const { credentials } = this.getPhonePeClient(appId);
    const authResponse = await this.getAuthToken(appId);
    const accessToken = authResponse.access_token;

    const baseUrl =
      credentials.env === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/pg/checkout/v2'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2';

    const url = `${baseUrl}/order/${merchantOrderId}/status?details=false`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `O-Bearer ${accessToken}`,
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `PhonePe Mobile Check Status Failed: ${response.status} - ${errorText}`,
        );
      }

      const data = (await response.json()) as PhonePeAuthTokenResponse;
      this.logger.log(`[PhonePe] Mobile status checked: ${merchantOrderId}`);
      return data;
    } catch (error) {
      this.logger.error('[PhonePe] Mobile check status failed:', error);
      throw error;
    }
  }

  async getAuthToken(appId: string) {
    const cacheKey = this.getCacheKey(appId);
    const { credentials } = this.getPhonePeClient(appId);
    const now = Date.now();

    if (
      this.tokenCache[cacheKey] &&
      this.tokenCache[cacheKey].expiresAt > now + 300000
    ) {
      this.logger.log(`[PhonePe] Using cached token for ${cacheKey}`);
      return this.tokenCache[cacheKey].token;
    }

    const isProd = credentials.env === 'PRODUCTION';
    const url = isProd
      ? 'https://api.phonepe.com/apis/hermes/v1/oauth/token'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

    const params = new URLSearchParams();
    params.append('client_id', credentials.clientId);
    params.append('client_version', String(credentials.clientVersion));
    params.append('client_secret', credentials.clientSecret);
    params.append('grant_type', 'client_credentials');

    try {
      this.logger.log(`[PhonePe] Fetching new token for ${cacheKey}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
        body: params,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `PhonePe Auth Failed: ${response.status} - ${errorText}`,
        );
      }

      const data = (await response.json()) as PhonePeAuthTokenResponse;

      this.tokenCache[cacheKey] = {
        token: data,
        expiresAt: data.expires_at,
      };

      this.logger.log(`[PhonePe] Token cached for ${cacheKey}`);
      return data;
    } catch (error) {
      this.logger.error(`[PhonePe] Auth error for ${cacheKey}:`, error);
      throw error;
    }
  }

  async createOrderToken(
    userId: string,
    appId: string,
    dto: {
      amount: number;
      merchantOrderId?: string;
      expireAfter?: number;
      redirectUrl?: string;
      disablePaymentRetry?: boolean;
      metaInfo?: Record<string, string | undefined>;
      paymentFlow?: { type: string; [key: string]: unknown };
    },
  ) {
    const {
      amount,
      merchantOrderId: customOrderId,
      expireAfter = 1200,
      metaInfo,
      paymentFlow,
      redirectUrl,
      disablePaymentRetry = false,
    } = dto;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Valid amount is required');
    }

    const { credentials } = this.getPhonePeClient(appId);
    const amountInPaise = this.rupeesToPaise(amount);
    const merchantOrderId = customOrderId || nanoid(10);

    const order = await this.createLocalOrder(
      merchantOrderId,
      userId,
      appId,
      amountInPaise,
    );

    const authResponse = await this.getAuthToken(appId);
    const accessToken = authResponse.access_token;

    const isProd = credentials.env === 'PRODUCTION';

    const url = isProd
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/sdk/order'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/sdk/order';

    const requestData: Record<string, unknown> = {
      merchantOrderId,
      amount: amountInPaise,
      expireAfter,
    };

    if (redirectUrl) requestData.redirectUrl = redirectUrl;
    if (disablePaymentRetry)
      requestData.disablePaymentRetry = disablePaymentRetry;
    if (metaInfo) requestData.metaInfo = metaInfo;
    if (!paymentFlow) {
      requestData.paymentFlow = { type: 'PG_CHECKOUT' };
    } else {
      requestData.paymentFlow = paymentFlow;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `O-Bearer ${accessToken}`,
          accept: 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `PhonePe Create Order Token Failed: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      this.logger.log(`[PhonePe] Order token created: ${merchantOrderId}`);

      return {
        ...data,
        localOrderId: order.id,
      };
    } catch (error) {
      this.logger.error('[PhonePe] Create order token failed:', error);
      throw new InternalServerErrorException(
        `Failed to create PhonePe order token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async setupSubscription(
    userId: string,
    appId: string,
    dto: {
      amount?: number;
      maxAmount: number;
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
      redirectUrl: string;
      merchantSubscriptionId?: string;
      authWorkflowType?: 'TRANSACTION' | 'PENNY_DROP';
      amountType?: 'FIXED' | 'VARIABLE';
      metaInfo?: Record<string, string | undefined>;
    },
  ) {
    const {
      amount,
      maxAmount,
      frequency,
      redirectUrl,
      merchantSubscriptionId: customSubId,
      authWorkflowType = 'TRANSACTION',
      amountType = 'VARIABLE',
      metaInfo,
    } = dto;

    if (!maxAmount || maxAmount <= 0) {
      throw new BadRequestException('Valid maxAmount is required');
    }

    if (!frequency) {
      throw new BadRequestException('frequency is required');
    }

    if (!redirectUrl) {
      throw new BadRequestException('redirectUrl is required');
    }

    const initialAmountPaise = amount ? this.rupeesToPaise(amount) : 0;
    const maxAmountPaise = this.rupeesToPaise(maxAmount);
    const merchantSubscriptionId = customSubId || nanoid(10);
    const merchantOrderId = nanoid(10);

    try {
      await this.db.insert(schema.phonepeSubscriptions).values({
        id: nanoid(10),
        merchantSubscriptionId,
        userId,
        appId,
        phonepeSubscriptionId: `temp_${Date.now()}`,
        amount: initialAmountPaise,
        amountType,
        frequency,
        state: 'CREATED' as const,
      });
    } catch (error) {
      this.logger.error('[PhonePe] DB insert error:', error);
    }

    const orderTokenResponse = await this.createOrderToken(userId, appId, {
      merchantOrderId,
      amount: initialAmountPaise,
      redirectUrl,
      paymentFlow: {
        type: 'SUBSCRIPTION_CHECKOUT_SETUP',
        subscriptionDetails: {
          merchantSubscriptionId,
          subscriptionType: 'RECURRING',
          authWorkflowType,
          amountType,
          maxAmount: maxAmountPaise,
          frequency,
          productType: 'UPI_MANDATE',
        },
      },
      metaInfo,
    });

    this.logger.log(
      `[PhonePe] Subscription setup initiated: ${merchantSubscriptionId}`,
    );

    return {
      ...orderTokenResponse,
      merchantSubscriptionId,
      merchantOrderId,
    };
  }

  getSdkConfig(userId: string, appId: string) {
    const { credentials } = this.getPhonePeClient(appId);

    return {
      environment: credentials.env,
      merchantId: credentials.merchantId,
      flowId: userId,
      enableLogging: credentials.env !== 'PRODUCTION',
    };
  }

  private async createLocalOrder(
    merchantOrderId: string,
    userId: string,
    appId: string,
    amountInPaise: number,
  ) {
    const [order] = await this.db
      .insert(schema.orders)
      .values({
        id: merchantOrderId,
        userId,
        appId,
        customerId: userId,
        amount: amountInPaise,
        status: 'created',
      })
      .returning();

    return order;
  }
}
