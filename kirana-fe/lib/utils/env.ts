export const IS_CI = process.env.CI === 'true';

/**
 * Placeholder values for critical environment variables to satisfy 
 * module initialization logic during CI/CD build processes.
 */
const FAKE_ENV_VARS: Record<string, string> = {
  R2_ACCOUNT_ID: "placeholder-account-id",
  R2_BUCKET_NAME: "placeholder-bucket",
  R2_ACCESS_KEY_ID: "placeholder-key",
  R2_SECRET_ACCESS_KEY: "placeholder-secret",
  PHONEPE_CLIENT_ID: "placeholder-phonepe-id",
  PHONEPE_CLIENT_SECRET: "placeholder-phonepe-secret",
  PHONEPE_CLIENT_ID_DEV: "placeholder-phonepe-dev-id",
  PHONEPE_CLIENT_SECRET_DEV: "placeholder-phonepe-dev-secret",
  NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_test_placeholder",
  RAZORPAY_KEY_SECRET: "placeholder-razorpay-secret",
  FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({ project_id: "placeholder" }),
};

/**
 * Injects placeholder environment variables if the process is running in a CI environment.
 */
export function setupCiEnv() {
  if (!IS_CI) return;
  
  console.log("[CI Mode] Injecting placeholder environment variables...");
  for (const [key, value] of Object.entries(FAKE_ENV_VARS)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Automatically execute on module load if in CI
if (IS_CI) {
  setupCiEnv();
}
