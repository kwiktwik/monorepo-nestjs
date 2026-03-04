/**
 * Test cases for Analytics Events
 * 
 * Tests event constants, client-side tracking, and server-side analytics
 * 
 * Usage: npx tsx lib/events/events.test.ts
 */

import { ANALYTICS_EVENTS, type AnalyticsEventName } from "./constant";
import { 
  FIREBASE_CLIENT_EVENTS, 
  ALL_EVENTS,
  type CommonEventParams,
  type PurchaseEventParams,
  type SubscriptionEventParams 
} from "./firebase-events";

// ============================================
// TEST CASES FOR EVENT CONSTANTS
// ============================================

interface EventConstantTest {
  name: string;
  category: string;
  expectedEvents: string[];
  validateFormat: boolean;
}

const eventConstantTests: EventConstantTest[] = [
  {
    name: "Payment events should have correct snake_case values",
    category: "payment",
    expectedEvents: [
      ANALYTICS_EVENTS.PAYMENT_CAPTURED,
      ANALYTICS_EVENTS.PAYMENT_FAILED,
      ANALYTICS_EVENTS.PAYMENT_AUTHORIZED,
    ],
    validateFormat: true,
  },
  {
    name: "Subscription events should have correct values",
    category: "subscription",
    expectedEvents: [
      ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
      ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
      ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
      ANALYTICS_EVENTS.SUBSCRIPTION_PENDING,
      ANALYTICS_EVENTS.SUBSCRIPTION_HALTED,
      ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED,
      ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
      ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED,
      ANALYTICS_EVENTS.SUBSCRIPTION_AUTHENTICATED,
      ANALYTICS_EVENTS.SUBSCRIPTION_NOT_CANCELLED_4H,
    ],
    validateFormat: true,
  },
  {
    name: "Token events should have correct values",
    category: "token",
    expectedEvents: [
      ANALYTICS_EVENTS.TOKEN_CONFIRMED,
      ANALYTICS_EVENTS.TOKEN_REJECTED,
      ANALYTICS_EVENTS.TOKEN_PAUSED,
      ANALYTICS_EVENTS.TOKEN_CANCELLED,
    ],
    validateFormat: true,
  },
  {
    name: "Order events should have correct values",
    category: "order",
    expectedEvents: [
      ANALYTICS_EVENTS.ORDER_PAID,
    ],
    validateFormat: true,
  },
];

// ============================================
// TEST CASES FOR FIREBASE CLIENT EVENTS
// ============================================

interface FirebaseEventTest {
  name: string;
  eventConstant: string;
  expectedValue: string;
  category: string;
}

const firebaseEventTests: FirebaseEventTest[] = [
  // Authentication events
  { name: "SIGN_UP constant", eventConstant: FIREBASE_CLIENT_EVENTS.SIGN_UP, expectedValue: "sign_up", category: "auth" },
  { name: "LOGIN constant", eventConstant: FIREBASE_CLIENT_EVENTS.LOGIN, expectedValue: "login", category: "auth" },
  { name: "LOGOUT constant", eventConstant: FIREBASE_CLIENT_EVENTS.LOGOUT, expectedValue: "logout", category: "auth" },
  { name: "OTP_SENT constant", eventConstant: FIREBASE_CLIENT_EVENTS.OTP_SENT, expectedValue: "otp_sent", category: "auth" },
  { name: "OTP_VERIFIED constant", eventConstant: FIREBASE_CLIENT_EVENTS.OTP_VERIFIED, expectedValue: "otp_verified", category: "auth" },
  { name: "OTP_FAILED constant", eventConstant: FIREBASE_CLIENT_EVENTS.OTP_FAILED, expectedValue: "otp_failed", category: "auth" },
  { name: "TRUECALLER_AUTH constant", eventConstant: FIREBASE_CLIENT_EVENTS.TRUECALLER_AUTH, expectedValue: "truecaller_auth", category: "auth" },
  
  // UI Interaction events
  { name: "APP_OPEN constant", eventConstant: FIREBASE_CLIENT_EVENTS.APP_OPEN, expectedValue: "app_open", category: "ui" },
  { name: "SCREEN_VIEW constant", eventConstant: FIREBASE_CLIENT_EVENTS.SCREEN_VIEW, expectedValue: "screen_view", category: "ui" },
  { name: "PAGE_VIEW constant", eventConstant: FIREBASE_CLIENT_EVENTS.PAGE_VIEW, expectedValue: "page_view", category: "ui" },
  { name: "BUTTON_CLICK constant", eventConstant: FIREBASE_CLIENT_EVENTS.BUTTON_CLICK, expectedValue: "button_click", category: "ui" },
  { name: "FORM_SUBMIT constant", eventConstant: FIREBASE_CLIENT_EVENTS.FORM_SUBMIT, expectedValue: "form_submit", category: "ui" },
  { name: "SEARCH constant", eventConstant: FIREBASE_CLIENT_EVENTS.SEARCH, expectedValue: "search", category: "ui" },
  { name: "SHARE constant", eventConstant: FIREBASE_CLIENT_EVENTS.SHARE, expectedValue: "share", category: "ui" },
  
  // Payment flow events
  { name: "BEGIN_CHECKOUT constant", eventConstant: FIREBASE_CLIENT_EVENTS.BEGIN_CHECKOUT, expectedValue: "begin_checkout", category: "payment" },
  { name: "ADD_PAYMENT_INFO constant", eventConstant: FIREBASE_CLIENT_EVENTS.ADD_PAYMENT_INFO, expectedValue: "add_payment_info", category: "payment" },
  { name: "PURCHASE constant", eventConstant: FIREBASE_CLIENT_EVENTS.PURCHASE, expectedValue: "purchase", category: "payment" },
  { name: "REFUND constant", eventConstant: FIREBASE_CLIENT_EVENTS.REFUND, expectedValue: "refund", category: "payment" },
  
  // Subscription events
  { name: "VIEW_SUBSCRIPTION_PLANS constant", eventConstant: FIREBASE_CLIENT_EVENTS.VIEW_SUBSCRIPTION_PLANS, expectedValue: "view_subscription_plans", category: "subscription" },
  { name: "SELECT_SUBSCRIPTION_PLAN constant", eventConstant: FIREBASE_CLIENT_EVENTS.SELECT_SUBSCRIPTION_PLAN, expectedValue: "select_subscription_plan", category: "subscription" },
  
  // Media events
  { name: "VIDEO_UPLOADED constant", eventConstant: FIREBASE_CLIENT_EVENTS.VIDEO_UPLOADED, expectedValue: "video_uploaded", category: "media" },
  { name: "VIDEO_PROCESSED constant", eventConstant: FIREBASE_CLIENT_EVENTS.VIDEO_PROCESSED, expectedValue: "video_processed", category: "media" },
  { name: "IMAGE_UPLOADED constant", eventConstant: FIREBASE_CLIENT_EVENTS.IMAGE_UPLOADED, expectedValue: "image_uploaded", category: "media" },
  { name: "MEDIA_SHARED constant", eventConstant: FIREBASE_CLIENT_EVENTS.MEDIA_SHARED, expectedValue: "media_shared", category: "media" },
  
  // Error events
  { name: "APP_ERROR constant", eventConstant: FIREBASE_CLIENT_EVENTS.APP_ERROR, expectedValue: "app_error", category: "error" },
  { name: "API_ERROR constant", eventConstant: FIREBASE_CLIENT_EVENTS.API_ERROR, expectedValue: "api_error", category: "error" },
  { name: "UPLOAD_ERROR constant", eventConstant: FIREBASE_CLIENT_EVENTS.UPLOAD_ERROR, expectedValue: "upload_error", category: "error" },
  
  // Engagement events
  { name: "VIEW_PROFILE constant", eventConstant: FIREBASE_CLIENT_EVENTS.VIEW_PROFILE, expectedValue: "view_profile", category: "engagement" },
  { name: "UPDATE_PROFILE constant", eventConstant: FIREBASE_CLIENT_EVENTS.UPDATE_PROFILE, expectedValue: "update_profile", category: "engagement" },
  { name: "SETTINGS_CHANGE constant", eventConstant: FIREBASE_CLIENT_EVENTS.SETTINGS_CHANGE, expectedValue: "settings_change", category: "engagement" },
  { name: "HELP_ACCESSED constant", eventConstant: FIREBASE_CLIENT_EVENTS.HELP_ACCESSED, expectedValue: "help_accessed", category: "engagement" },
];

// ============================================
// TEST CASES FOR EVENT PARAMETER INTERFACES
// ============================================

interface ParameterValidationTest {
  name: string;
  params: CommonEventParams;
  shouldBeValid: boolean;
  requiredFields?: string[];
}

const parameterValidationTests: ParameterValidationTest[] = [
  {
    name: "Common params with user info",
    params: {
      user_id: "user_123",
      user_role: "premium",
      app_version: "1.0.0",
      platform: "web",
    },
    shouldBeValid: true,
  },
  {
    name: "Common params with payment info",
    params: {
      currency: "INR",
      value: 999.99,
      transaction_id: "txn_123456",
      payment_method: "upi",
    },
    shouldBeValid: true,
  },
  {
    name: "Common params with content info",
    params: {
      content_type: "video",
      content_id: "vid_789",
      item_name: "Premium Plan",
    },
    shouldBeValid: true,
  },
  {
    name: "Common params with error info",
    params: {
      error_message: "Something went wrong",
      error_code: "ERR_001",
    },
    shouldBeValid: true,
  },
  {
    name: "Empty common params",
    params: {},
    shouldBeValid: true,
  },
  {
    name: "Common params with additional custom fields",
    params: {
      user_id: "user_456",
      custom_field_1: "custom value",
      custom_number: 42,
      custom_boolean: true,
      nested_array: ["item1", "item2"],
    },
    shouldBeValid: true,
  },
];

// ============================================
// TEST CASES FOR PURCHASE EVENT PARAMETERS
// ============================================

interface PurchaseEventTest {
  name: string;
  params: PurchaseEventParams;
  shouldBeValid: boolean;
  description: string;
}

const purchaseEventTests: PurchaseEventTest[] = [
  {
    name: "Complete purchase event with items",
    params: {
      transaction_id: "txn_12345",
      value: 1999.99,
      currency: "INR",
      items: [
        {
          item_id: "plan_premium",
          item_name: "Premium Subscription",
          price: 1999.99,
          quantity: 1,
        },
      ],
      user_id: "user_123",
    },
    shouldBeValid: true,
    description: "Full purchase event with all required fields and items array",
  },
  {
    name: "Purchase event without items",
    params: {
      transaction_id: "txn_67890",
      value: 499.50,
      currency: "USD",
    },
    shouldBeValid: true,
    description: "Purchase event with only required fields",
  },
  {
    name: "Purchase event with multiple items",
    params: {
      transaction_id: "txn_multi",
      value: 3500.00,
      currency: "INR",
      items: [
        { item_id: "item_1", item_name: "Product A", price: 1000.00, quantity: 2 },
        { item_id: "item_2", item_name: "Product B", price: 1500.00, quantity: 1 },
      ],
    },
    shouldBeValid: true,
    description: "Purchase event with multiple items in cart",
  },
  {
    name: "Purchase event with zero value",
    params: {
      transaction_id: "txn_free",
      value: 0,
      currency: "INR",
    },
    shouldBeValid: true,
    description: "Purchase event with zero value (free transaction)",
  },
];

// ============================================
// TEST CASES FOR SUBSCRIPTION EVENT PARAMETERS
// ============================================

interface SubscriptionEventTest {
  name: string;
  params: SubscriptionEventParams;
  shouldBeValid: boolean;
  description: string;
}

const subscriptionEventTests: SubscriptionEventTest[] = [
  {
    name: "Monthly subscription event",
    params: {
      plan_name: "Basic Monthly",
      plan_id: "basic_monthly",
      billing_period: "monthly",
      price: 99.00,
      currency: "INR",
      user_id: "user_123",
    },
    shouldBeValid: true,
    description: "Monthly subscription with all required fields",
  },
  {
    name: "Yearly subscription event",
    params: {
      plan_name: "Premium Yearly",
      plan_id: "premium_yearly",
      billing_period: "yearly",
      price: 999.00,
      currency: "INR",
      user_id: "user_456",
      platform: "android",
    },
    shouldBeValid: true,
    description: "Yearly subscription with additional platform info",
  },
  {
    name: "Weekly subscription event",
    params: {
      plan_name: "Trial Weekly",
      plan_id: "trial_weekly",
      billing_period: "weekly",
      price: 0,
      currency: "INR",
    },
    shouldBeValid: true,
    description: "Weekly subscription (trial period)",
  },
];

// ============================================
// EVENT NAME FORMAT VALIDATION TESTS
// ============================================

interface EventFormatTest {
  name: string;
  eventName: string;
  shouldMatchSnakeCase: boolean;
  shouldMatchUpperSnakeCase: boolean;
}

const eventFormatTests: EventFormatTest[] = [
  { name: "snake_case event", eventName: "payment_captured", shouldMatchSnakeCase: true, shouldMatchUpperSnakeCase: false },
  { name: "UPPER_SNAKE_CASE constant", eventName: "PAYMENT_CAPTURED", shouldMatchSnakeCase: false, shouldMatchUpperSnakeCase: true },
  { name: "camelCase event", eventName: "paymentCaptured", shouldMatchSnakeCase: false, shouldMatchUpperSnakeCase: false },
  { name: "kebab-case event", eventName: "payment-captured", shouldMatchSnakeCase: false, shouldMatchUpperSnakeCase: false },
  { name: "PascalCase event", eventName: "PaymentCaptured", shouldMatchSnakeCase: false, shouldMatchUpperSnakeCase: false },
  { name: "Event with numbers", eventName: "trial_not_cancel_in_4_hour", shouldMatchSnakeCase: true, shouldMatchUpperSnakeCase: false },
  { name: "Simple event", eventName: "login", shouldMatchSnakeCase: true, shouldMatchUpperSnakeCase: false },
];

// ============================================
// TEST RUNNER
// ============================================

function assertEqual(actual: any, expected: any, testName: string): boolean {
  const passed = actual === expected;
  if (!passed) {
    console.log(`  ❌ Expected "${expected}", got "${actual}"`);
  }
  return passed;
}

function assertDefined(value: any, testName: string): boolean {
  const passed = value !== undefined && value !== null;
  if (!passed) {
    console.log(`  ❌ Value should be defined`);
  }
  return passed;
}

function assertSnakeCase(value: string, testName: string): boolean {
  const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;
  const passed = snakeCaseRegex.test(value);
  if (!passed) {
    console.log(`  ❌ "${value}" is not valid snake_case`);
  }
  return passed;
}

function assertUpperSnakeCase(value: string, testName: string): boolean {
  const upperSnakeCaseRegex = /^[A-Z][A-Z0-9_]*$/;
  const passed = upperSnakeCaseRegex.test(value);
  if (!passed) {
    console.log(`  ❌ "${value}" is not valid UPPER_SNAKE_CASE`);
  }
  return passed;
}

function runTests() {
  console.log("🧪 Running Analytics Events Tests\n");
  console.log("=" .repeat(80));

  let passed = 0;
  let failed = 0;
  let totalTests = 0;

  // Test 1: Event Constants - Payment Events
  console.log("\n📋 Test Suite 1: Payment Event Constants");
  console.log("-".repeat(80));
  eventConstantTests
    .filter(test => test.category === "payment")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      let testPassed = true;

      test.expectedEvents.forEach(eventValue => {
        if (test.validateFormat) {
          if (!assertSnakeCase(eventValue, test.name)) {
            testPassed = false;
          }
        }
      });

      if (testPassed) {
        console.log(`  ✅ All payment events use valid snake_case format`);
        passed++;
      } else {
        console.log(`  ❌ Test FAILED`);
        failed++;
      }
    });

  // Test 2: Event Constants - Subscription Events
  console.log("\n📋 Test Suite 2: Subscription Event Constants");
  console.log("-".repeat(80));
  eventConstantTests
    .filter(test => test.category === "subscription")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      let testPassed = true;

      test.expectedEvents.forEach(eventValue => {
        if (test.validateFormat) {
          if (!assertSnakeCase(eventValue, test.name)) {
            testPassed = false;
          }
        }
      });

      if (testPassed) {
        console.log(`  ✅ All ${test.expectedEvents.length} subscription events use valid snake_case format`);
        passed++;
      } else {
        console.log(`  ❌ Test FAILED`);
        failed++;
      }
    });

  // Test 3: Event Constants - Token Events
  console.log("\n📋 Test Suite 3: Token Event Constants");
  console.log("-".repeat(80));
  eventConstantTests
    .filter(test => test.category === "token")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      let testPassed = true;

      test.expectedEvents.forEach(eventValue => {
        if (test.validateFormat) {
          if (!assertSnakeCase(eventValue, test.name)) {
            testPassed = false;
          }
        }
      });

      if (testPassed) {
        console.log(`  ✅ All token events use valid snake_case format`);
        passed++;
      } else {
        console.log(`  ❌ Test FAILED`);
        failed++;
      }
    });

  // Test 4: Event Constants - Order Events
  console.log("\n📋 Test Suite 4: Order Event Constants");
  console.log("-".repeat(80));
  eventConstantTests
    .filter(test => test.category === "order")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      let testPassed = true;

      test.expectedEvents.forEach(eventValue => {
        if (test.validateFormat) {
          if (!assertSnakeCase(eventValue, test.name)) {
            testPassed = false;
          }
        }
      });

      if (testPassed) {
        console.log(`  ✅ Order event uses valid snake_case format`);
        passed++;
      } else {
        console.log(`  ❌ Test FAILED`);
        failed++;
      }
    });

  // Test 5: Firebase Client Events - Authentication
  console.log("\n📋 Test Suite 5: Firebase Auth Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "auth")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 6: Firebase Client Events - UI Interactions
  console.log("\n📋 Test Suite 6: Firebase UI Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "ui")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 7: Firebase Client Events - Payment Flow
  console.log("\n📋 Test Suite 7: Firebase Payment Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "payment")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 8: Firebase Client Events - Subscription
  console.log("\n📋 Test Suite 8: Firebase Subscription Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "subscription")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 9: Firebase Client Events - Media
  console.log("\n📋 Test Suite 9: Firebase Media Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "media")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 10: Firebase Client Events - Error
  console.log("\n📋 Test Suite 10: Firebase Error Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "error")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 11: Firebase Client Events - Engagement
  console.log("\n📋 Test Suite 11: Firebase Engagement Event Constants");
  console.log("-".repeat(80));
  firebaseEventTests
    .filter(test => test.category === "engagement")
    .forEach(test => {
      totalTests++;
      console.log(`\n📝 ${test.name}`);
      const testPassed = assertEqual(test.eventConstant, test.expectedValue, test.name);

      if (testPassed) {
        console.log(`  ✅ Event constant has correct value: "${test.expectedValue}"`);
        passed++;
      } else {
        failed++;
      }
    });

  // Test 12: Parameter Validation
  console.log("\n📋 Test Suite 12: Common Event Parameters Validation");
  console.log("-".repeat(80));
  parameterValidationTests.forEach(test => {
    totalTests++;
    console.log(`\n📝 ${test.name}`);
    let testPassed = true;

    // Check if params object is valid
    if (typeof test.params !== 'object') {
      console.log(`  ❌ Parameters should be an object`);
      testPassed = false;
    } else {
      // Validate specific known fields
      if (test.params.currency && typeof test.params.currency !== 'string') {
        console.log(`  ❌ Currency should be a string`);
        testPassed = false;
      }
      if (test.params.value !== undefined && typeof test.params.value !== 'number') {
        console.log(`  ❌ Value should be a number`);
        testPassed = false;
      }
      if (test.params.user_id && typeof test.params.user_id !== 'string') {
        console.log(`  ❌ User ID should be a string`);
        testPassed = false;
      }
    }

    if (testPassed && test.shouldBeValid) {
      console.log(`  ✅ Parameters are valid`);
      passed++;
    } else if (!testPassed && !test.shouldBeValid) {
      console.log(`  ✅ Parameters correctly identified as invalid`);
      passed++;
    } else {
      console.log(`  ❌ Test FAILED`);
      failed++;
    }
  });

  // Test 13: Purchase Event Parameters
  console.log("\n📋 Test Suite 13: Purchase Event Parameters");
  console.log("-".repeat(80));
  purchaseEventTests.forEach(test => {
    totalTests++;
    console.log(`\n📝 ${test.name}`);
    console.log(`   ${test.description}`);
    let testPassed = true;

    // Check required fields
    if (!test.params.transaction_id) {
      console.log(`  ❌ Missing required field: transaction_id`);
      testPassed = false;
    }
    if (test.params.value === undefined) {
      console.log(`  ❌ Missing required field: value`);
      testPassed = false;
    }
    if (!test.params.currency) {
      console.log(`  ❌ Missing required field: currency`);
      testPassed = false;
    }

    // Check types
    if (test.params.transaction_id && typeof test.params.transaction_id !== 'string') {
      console.log(`  ❌ transaction_id should be a string`);
      testPassed = false;
    }
    if (typeof test.params.value !== 'number') {
      console.log(`  ❌ value should be a number`);
      testPassed = false;
    }
    if (typeof test.params.currency !== 'string') {
      console.log(`  ❌ currency should be a string`);
      testPassed = false;
    }

    // Check items array if present
    if (test.params.items && !Array.isArray(test.params.items)) {
      console.log(`  ❌ items should be an array`);
      testPassed = false;
    }

    if (testPassed) {
      console.log(`  ✅ Purchase event parameters are valid`);
      passed++;
    } else {
      console.log(`  ❌ Test FAILED`);
      failed++;
    }
  });

  // Test 14: Subscription Event Parameters
  console.log("\n📋 Test Suite 14: Subscription Event Parameters");
  console.log("-".repeat(80));
  subscriptionEventTests.forEach(test => {
    totalTests++;
    console.log(`\n📝 ${test.name}`);
    console.log(`   ${test.description}`);
    let testPassed = true;

    // Check required fields
    if (!test.params.plan_name) {
      console.log(`  ❌ Missing required field: plan_name`);
      testPassed = false;
    }
    if (!test.params.plan_id) {
      console.log(`  ❌ Missing required field: plan_id`);
      testPassed = false;
    }
    if (!test.params.billing_period) {
      console.log(`  ❌ Missing required field: billing_period`);
      testPassed = false;
    }
    if (test.params.price === undefined) {
      console.log(`  ❌ Missing required field: price`);
      testPassed = false;
    }
    if (!test.params.currency) {
      console.log(`  ❌ Missing required field: currency`);
      testPassed = false;
    }

    // Validate billing period
    const validBillingPeriods = ['monthly', 'yearly', 'weekly'];
    if (test.params.billing_period && !validBillingPeriods.includes(test.params.billing_period)) {
      console.log(`  ❌ Invalid billing_period: "${test.params.billing_period}"`);
      testPassed = false;
    }

    if (testPassed) {
      console.log(`  ✅ Subscription event parameters are valid`);
      passed++;
    } else {
      console.log(`  ❌ Test FAILED`);
      failed++;
    }
  });

  // Test 15: Event Name Format Validation
  console.log("\n📋 Test Suite 15: Event Name Format Validation");
  console.log("-".repeat(80));
  eventFormatTests.forEach(test => {
    totalTests++;
    console.log(`\n📝 ${test.name}: "${test.eventName}"`);
    let testPassed = true;

    const isSnakeCase = /^[a-z][a-z0-9_]*$/.test(test.eventName);
    const isUpperSnakeCase = /^[A-Z][A-Z0-9_]*$/.test(test.eventName);

    if (test.shouldMatchSnakeCase && !isSnakeCase) {
      console.log(`  ❌ Expected snake_case format`);
      testPassed = false;
    }
    if (test.shouldMatchUpperSnakeCase && !isUpperSnakeCase) {
      console.log(`  ❌ Expected UPPER_SNAKE_CASE format`);
      testPassed = false;
    }
    if (!test.shouldMatchSnakeCase && !test.shouldMatchUpperSnakeCase && (isSnakeCase || isUpperSnakeCase)) {
      console.log(`  ❌ Should NOT match snake_case or UPPER_SNAKE_CASE`);
      testPassed = false;
    }

    if (testPassed) {
      console.log(`  ✅ Format validation passed`);
      passed++;
    } else {
      console.log(`  ❌ Test FAILED`);
      failed++;
    }
  });

  // Test 16: Combined Events (ALL_EVENTS)
  console.log("\n📋 Test Suite 16: Combined Events Object (ALL_EVENTS)");
  console.log("-".repeat(80));
  totalTests++;
  console.log(`\n📝 Verify ALL_EVENTS combines both event sets`);
  let allEventsPassed = true;

  const allEventKeys = Object.keys(ALL_EVENTS);
  const analyticsEventKeys = Object.keys(ANALYTICS_EVENTS);
  const firebaseEventKeys = Object.keys(FIREBASE_CLIENT_EVENTS);

  console.log(`   Total events in ALL_EVENTS: ${allEventKeys.length}`);
  console.log(`   Events from ANALYTICS_EVENTS: ${analyticsEventKeys.length}`);
  console.log(`   Events from FIREBASE_CLIENT_EVENTS: ${firebaseEventKeys.length}`);

  // Check that all ANALYTICS_EVENTS are included
  analyticsEventKeys.forEach(key => {
    if (!allEventKeys.includes(key)) {
      console.log(`  ❌ Missing ANALYTICS_EVENTS key: ${key}`);
      allEventsPassed = false;
    }
  });

  // Check that all FIREBASE_CLIENT_EVENTS are included
  firebaseEventKeys.forEach(key => {
    if (!allEventKeys.includes(key)) {
      console.log(`  ❌ Missing FIREBASE_CLIENT_EVENTS key: ${key}`);
      allEventsPassed = false;
    }
  });

  // Check for expected total
  const expectedTotal = analyticsEventKeys.length + firebaseEventKeys.length;
  if (allEventKeys.length !== expectedTotal) {
    console.log(`  ⚠️  Expected ${expectedTotal} events, got ${allEventKeys.length} (may have duplicates)`);
  }

  if (allEventsPassed) {
    console.log(`  ✅ ALL_EVENTS correctly combines all event constants`);
    passed++;
  } else {
    console.log(`  ❌ Test FAILED`);
    failed++;
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);

  console.log("\n📋 Event Coverage Summary:");
  console.log(`   Payment Events: 3`);
  console.log(`   Subscription Events: 10`);
  console.log(`   Token Events: 4`);
  console.log(`   Order Events: 1`);
  console.log(`   Firebase Auth Events: 7`);
  console.log(`   Firebase UI Events: 7`);
  console.log(`   Firebase Payment Events: 4`);
  console.log(`   Firebase Subscription Events: 2`);
  console.log(`   Firebase Media Events: 4`);
  console.log(`   Firebase Error Events: 3`);
  console.log(`   Firebase Engagement Events: 4`);
  console.log(`   Total Unique Events: ${allEventKeys.length}`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
runTests();
