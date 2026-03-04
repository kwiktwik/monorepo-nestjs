import { StandardCheckoutClient, Env } from 'pg-sdk-node';
import type { PhonePeEnv } from '@/lib/phonepe-env';

/**
 * PhonePe SDK Client Manager
 * 
 * IMPORTANT: The PhonePe SDK only allows ONE getInstance() call per process.
 * 
 * Environment is controlled by PHONEPE_ENV:
 * - PHONEPE_ENV=SANDBOX -> Uses PHONEPE_CLIENT_ID_DEV and PHONEPE_CLIENT_SECRET_DEV
 * - PHONEPE_ENV=PRODUCTION -> Uses PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET
 * 
 * To switch environments, restart the server with different PHONEPE_ENV value.
 */

/**
 * Get the default environment from environment variables
 */
export function getDefaultEnv(): PhonePeEnv {
    const envVar = process.env.PHONEPE_ENV;
    return envVar === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX';
}

const defaultEnv = getDefaultEnv();
const isProd = defaultEnv === 'PRODUCTION';

// Get credentials based on environment
// SANDBOX uses _DEV credentials, PRODUCTION uses base credentials
const clientId = isProd
    ? process.env.PHONEPE_CLIENT_ID
    : (process.env.PHONEPE_CLIENT_ID_DEV || process.env.PHONEPE_CLIENT_ID);

const clientSecret = isProd
    ? process.env.PHONEPE_CLIENT_SECRET
    : (process.env.PHONEPE_CLIENT_SECRET_DEV || process.env.PHONEPE_CLIENT_SECRET);

const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10);
const sdkEnv = isProd ? Env.PRODUCTION : Env.SANDBOX;

if (!clientId || !clientSecret) {
    const requiredVars = isProd
        ? 'PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET'
        : 'PHONEPE_CLIENT_ID_DEV and PHONEPE_CLIENT_SECRET_DEV';
    throw new Error(
        `Missing PhonePe credentials for ${defaultEnv} environment. Please set ${requiredVars}.`
    );
}

// Initialize the client ONCE at module level (as per official PhonePe SDK documentation)
// The SDK uses a singleton pattern and getInstance() should only be called ONCE per process
console.log(`[PhonePe Client] Initializing ${defaultEnv} client...`);
console.log(`[PhonePe Client] Client ID: ${clientId.substring(0, 10)}...`);

const phonePeClient = StandardCheckoutClient.getInstance(
    clientId,
    clientSecret,
    clientVersion,
    sdkEnv
);

console.log(`[PhonePe Client] Successfully initialized for ${defaultEnv} environment`);

/**
 * Get the PhonePe StandardCheckoutClient instance
 * 
 * @param env - Optional environment parameter. Currently ignored as the SDK only supports
 *              one environment per process. The environment is determined at startup.
 *              This parameter is kept for API compatibility.
 * @returns The StandardCheckoutClient singleton instance
 */
export function getPhonePeClient(env?: PhonePeEnv): StandardCheckoutClient {
    // Log a warning if someone tries to use a different environment
    if (env && env !== defaultEnv) {
        console.warn(
            `[PhonePe Client] Requested ${env} but client is initialized for ${defaultEnv}. ` +
            `PhonePe SDK only supports one environment per process. Restart the server to switch environments.`
        );
    }
    return phonePeClient;
}

