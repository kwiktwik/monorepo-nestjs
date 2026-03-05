/**
 * Test Script for Paywall Rules Engine
 * 
 * This script tests all combinations of:
 * - App IDs
 * - User Types
 * - Deeplink Campaigns
 * 
 * Run with: node scripts/test-paywall-rules.mjs
 * 
 * STRICT MODE: Will throw error if no rule matches
 */

import { Engine, Rule } from 'json-rules-engine';

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

const PAYWALL_PLANS = {
  STANDARD: {
    plan_id: 'plan_standard_199',
    pricing: { initialAmount: '₹199', recurringAmount: '₹199', period: 'month' },
    heading: 'Standard Plan',
    description: 'Get all premium features',
    buttonText: 'Subscribe Now',
  },
  NEW_USER_WELCOME: {
    plan_id: 'plan_new_user_welcome_99',
    pricing: { initialAmount: '₹99', recurringAmount: '₹199', period: 'month' },
    heading: 'Welcome Offer!',
    description: 'Special 50% off for your first month',
    buttonText: 'Claim Offer',
  },
  ABANDONED_CHECKOUT: {
    plan_id: 'plan_abandoned_checkout_49',
    pricing: { initialAmount: '₹49', recurringAmount: '₹199', period: 'month' },
    heading: 'Wait! We have a special gift',
    description: 'Get started for just ₹49 today',
    buttonText: "Don't Miss Out",
  },
  MARKETING_CAMPAIGN: {
    plan_id: 'plan_marketing_campaign_79',
    pricing: { initialAmount: '₹79', recurringAmount: '₹199', period: 'month' },
    heading: 'Exclusive Campaign Offer!',
    description: 'Limited time offer just for you',
    buttonText: 'Grab Now',
  },
  LOYAL_USER: {
    plan_id: 'plan_loyal_user_149',
    pricing: { initialAmount: '₹149', recurringAmount: '₹199', period: 'month' },
    heading: 'Loyalty Reward',
    description: 'Thank you for being with us!',
    buttonText: 'Claim Reward',
  },
  TRIAL_EXPIRED: {
    plan_id: 'plan_trial_expired_59',
    pricing: { initialAmount: '₹59', recurringAmount: '₹199', period: 'month' },
    heading: 'Continue Your Journey',
    description: 'Special price to welcome you back',
    buttonText: 'Continue Now',
  },
};

const USER_TYPES = {
  NEW: 'new',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  ABANDONED: 'abandoned',
  TRIAL_EXPIRED: 'trial_expired',
  CHURNED: 'churned',
};

const DEEPLINK_CAMPAIGNS = {
  NONE: 'none',
  MARKETING_50_PERCENT: 'marketing_50_percent',
  MARKETING_TRIAL: 'marketing_trial',
  REFERRAL: 'referral',
  RETARGETING: 'retargeting',
  SEASONAL: 'seasonal',
};

const APP_IDS = [
  'com.paymentalert.app',
  'com.sharekaro.kirana',
];

// ============================================================================
// PAYWALL RULES - Updated with event.type as rule name
// ============================================================================

const PAYWALL_RULES = [
  // Rule 1: Marketing Campaign - 50% off (highest priority for deeplink)
  {
    name: 'marketing_campaign_50_percent',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT },
      ],
    },
    event: {
      type: 'marketing_campaign_50_percent',
      params: {
        plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
        reason: 'User came from 50% marketing campaign',
        priority: 100,
      },
    },
    priority: 100,
  },

  // Rule 2: Referral Campaign
  {
    name: 'referral_campaign',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.REFERRAL },
      ],
    },
    event: {
      type: 'referral_campaign',
      params: {
        plan: PAYWALL_PLANS.NEW_USER_WELCOME,
        reason: 'User came from referral',
        priority: 90,
      },
    },
    priority: 90,
  },

  // Rule 3: Retargeting Campaign for churned users
  {
    name: 'retargeting_churned',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED },
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.RETARGETING },
      ],
    },
    event: {
      type: 'retargeting_churned',
      params: {
        plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
        reason: 'Churned user from retargeting campaign',
        priority: 95,
      },
    },
    priority: 95,
  },

  // Rule 4: Seasonal Campaign (any user type)
  {
    name: 'seasonal_campaign',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.SEASONAL },
      ],
    },
    event: {
      type: 'seasonal_campaign',
      params: {
        plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
        reason: 'Seasonal promotional campaign',
        priority: 85,
      },
    },
    priority: 85,
  },

  // Rule 5: Marketing Trial Campaign
  {
    name: 'marketing_trial',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.MARKETING_TRIAL },
        { fact: 'userType', operator: 'in', value: [USER_TYPES.NEW, USER_TYPES.TRIAL_EXPIRED] },
      ],
    },
    event: {
      type: 'marketing_trial',
      params: {
        plan: PAYWALL_PLANS.TRIAL_EXPIRED,
        reason: 'Marketing trial campaign for new/trial-expired users',
        priority: 80,
      },
    },
    priority: 80,
  },

  // Rule 6: Abandoned Checkout Users
  {
    name: 'abandoned_checkout',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ABANDONED },
      ],
    },
    event: {
      type: 'abandoned_checkout',
      params: {
        plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
        reason: 'User has abandoned checkout',
        priority: 70,
      },
    },
    priority: 70,
  },

  // Rule 7: Trial Expired Users
  {
    name: 'trial_expired',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.TRIAL_EXPIRED },
      ],
    },
    event: {
      type: 'trial_expired',
      params: {
        plan: PAYWALL_PLANS.TRIAL_EXPIRED,
        reason: 'Trial period expired',
        priority: 60,
      },
    },
    priority: 60,
  },

  // Rule 8: Churned Users (came back)
  {
    name: 'churned_user',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED },
      ],
    },
    event: {
      type: 'churned_user',
      params: {
        plan: PAYWALL_PLANS.LOYAL_USER,
        reason: 'Welcome back offer for churned user',
        priority: 50,
      },
    },
    priority: 50,
  },

  // Rule 9: New Users
  {
    name: 'new_user',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.NEW },
      ],
    },
    event: {
      type: 'new_user',
      params: {
        plan: PAYWALL_PLANS.NEW_USER_WELCOME,
        reason: 'Welcome offer for new user',
        priority: 40,
      },
    },
    priority: 40,
  },

  // Rule 10: Expired Subscription
  {
    name: 'expired_subscription',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.EXPIRED },
      ],
    },
    event: {
      type: 'expired_subscription',
      params: {
        plan: PAYWALL_PLANS.LOYAL_USER,
        reason: 'Renewal offer for expired subscription',
        priority: 30,
      },
    },
    priority: 30,
  },

  // Rule 11: Active Users
  {
    name: 'active_user',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ACTIVE },
      ],
    },
    event: {
      type: 'active_user',
      params: {
        plan: PAYWALL_PLANS.STANDARD,
        reason: 'Standard plan for active users',
        priority: 10,
      },
    },
    priority: 10,
  },

  // Rule 12: Default Fallback - MUST ALWAYS MATCH
  {
    name: 'default_fallback',
    conditions: {
      any: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.NEW },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ACTIVE },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.EXPIRED },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ABANDONED },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.TRIAL_EXPIRED },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED },
      ],
    },
    event: {
      type: 'default_fallback',
      params: {
        plan: PAYWALL_PLANS.STANDARD,
        reason: 'Default standard plan',
        priority: 1,
      },
    },
    priority: 1,
  },
];

// ============================================================================
// EXPECTED RESULTS FOR VALIDATION
// ============================================================================

const EXPECTED_RESULTS = {
  // Format: "userType:deeplink" -> { ruleName, planId }
  [`${USER_TYPES.NEW}:${DEEPLINK_CAMPAIGNS.NONE}`]: { ruleName: 'new_user', planId: 'plan_new_user_welcome_99' },
  [`${USER_TYPES.NEW}:${DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT}`]: { ruleName: 'marketing_campaign_50_percent', planId: 'plan_marketing_campaign_79' },
  [`${USER_TYPES.NEW}:${DEEPLINK_CAMPAIGNS.MARKETING_TRIAL}`]: { ruleName: 'marketing_trial', planId: 'plan_trial_expired_59' },
  [`${USER_TYPES.NEW}:${DEEPLINK_CAMPAIGNS.REFERRAL}`]: { ruleName: 'referral_campaign', planId: 'plan_new_user_welcome_99' },
  [`${USER_TYPES.NEW}:${DEEPLINK_CAMPAIGNS.RETARGETING}`]: { ruleName: 'new_user', planId: 'plan_new_user_welcome_99' },
  [`${USER_TYPES.NEW}:${DEEPLINK_CAMPAIGNS.SEASONAL}`]: { ruleName: 'seasonal_campaign', planId: 'plan_marketing_campaign_79' },
  
  [`${USER_TYPES.ACTIVE}:${DEEPLINK_CAMPAIGNS.NONE}`]: { ruleName: 'active_user', planId: 'plan_standard_199' },
  [`${USER_TYPES.ACTIVE}:${DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT}`]: { ruleName: 'marketing_campaign_50_percent', planId: 'plan_marketing_campaign_79' },
  [`${USER_TYPES.ACTIVE}:${DEEPLINK_CAMPAIGNS.REFERRAL}`]: { ruleName: 'referral_campaign', planId: 'plan_new_user_welcome_99' },
  [`${USER_TYPES.ACTIVE}:${DEEPLINK_CAMPAIGNS.SEASONAL}`]: { ruleName: 'seasonal_campaign', planId: 'plan_marketing_campaign_79' },
  
  [`${USER_TYPES.ABANDONED}:${DEEPLINK_CAMPAIGNS.NONE}`]: { ruleName: 'abandoned_checkout', planId: 'plan_abandoned_checkout_49' },
  [`${USER_TYPES.ABANDONED}:${DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT}`]: { ruleName: 'marketing_campaign_50_percent', planId: 'plan_marketing_campaign_79' },
  [`${USER_TYPES.ABANDONED}:${DEEPLINK_CAMPAIGNS.REFERRAL}`]: { ruleName: 'referral_campaign', planId: 'plan_new_user_welcome_99' },
  
  [`${USER_TYPES.CHURNED}:${DEEPLINK_CAMPAIGNS.NONE}`]: { ruleName: 'churned_user', planId: 'plan_loyal_user_149' },
  [`${USER_TYPES.CHURNED}:${DEEPLINK_CAMPAIGNS.RETARGETING}`]: { ruleName: 'retargeting_churned', planId: 'plan_abandoned_checkout_49' },
  
  [`${USER_TYPES.TRIAL_EXPIRED}:${DEEPLINK_CAMPAIGNS.NONE}`]: { ruleName: 'trial_expired', planId: 'plan_trial_expired_59' },
  [`${USER_TYPES.TRIAL_EXPIRED}:${DEEPLINK_CAMPAIGNS.MARKETING_TRIAL}`]: { ruleName: 'marketing_trial', planId: 'plan_trial_expired_59' },
  
  [`${USER_TYPES.EXPIRED}:${DEEPLINK_CAMPAIGNS.NONE}`]: { ruleName: 'expired_subscription', planId: 'plan_loyal_user_149' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printHeader(text) {
  console.log('\n' + '='.repeat(80));
  console.log(colorize(`  ${text}`, 'bright'));
  console.log('='.repeat(80));
}

function printSubHeader(text) {
  console.log('\n' + '-'.repeat(80));
  console.log(colorize(`  ${text}`, 'cyan'));
  console.log('-'.repeat(80));
}

function printResult(testCase, result, passed, expected = null) {
  const { appId, userType, deeplink } = testCase;
  const { plan, reason, ruleName } = result;
  
  const statusIcon = passed ? colorize('✓ PASS', 'green') : colorize('✗ FAIL', 'red');
  const statusBg = passed ? colorize('  PASS  ', 'bgGreen') : colorize('  FAIL  ', 'bgRed');
  
  console.log(`
┌─────────────────────────────────────────────────────────────────────────────┐
│ ${statusBg} ${colorize('TEST CASE', 'bright')}                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ App ID:      ${colorize(appId.padEnd(50), 'blue')}│
│ User Type:   ${colorize(userType.padEnd(50), 'yellow')}│
│ Deeplink:    ${colorize(deeplink.padEnd(50), 'magenta')}│
├─────────────────────────────────────────────────────────────────────────────┤
│ ${colorize('RESULT', 'bright')}                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Rule Matched: ${colorize(ruleName.padEnd(44), passed ? 'green' : 'red')}│
│ Plan ID:     ${colorize(plan.plan_id.padEnd(50), passed ? 'green' : 'red')}│
│ Price:       ${colorize(`${plan.pricing.initialAmount} (recurring: ${plan.pricing.recurringAmount})`.padEnd(50), 'green')}│
│ Heading:     ${colorize(plan.heading.padEnd(50), 'green')}│
│ Reason:      ${colorize(reason.substring(0, 50).padEnd(50), 'dim')}│
${expected ? `├─────────────────────────────────────────────────────────────────────────────┤
│ Expected Rule: ${colorize(expected.ruleName.padEnd(43), 'cyan')}│
│ Expected Plan: ${colorize(expected.planId.padEnd(43), 'cyan')}│` : ''}
└─────────────────────────────────────────────────────────────────────────────┘
  ${statusIcon}
`);
}

function printSummary(results, failedCount) {
  printHeader('SUMMARY');
  
  if (failedCount > 0) {
    console.log(colorize(`\n❌ ${failedCount} TEST(S) FAILED!`, 'red'));
    console.log(colorize('   Please check the failed test cases above.', 'red'));
  } else {
    console.log(colorize('\n✅ ALL TESTS PASSED!', 'green'));
  }
  
  // Group by plan
  const planCounts = {};
  for (const item of results) {
    const planId = item.result.plan.plan_id;
    if (!planCounts[planId]) {
      planCounts[planId] = {
        count: 0,
        plan: item.result.plan,
        cases: [],
      };
    }
    planCounts[planId].count++;
    planCounts[planId].cases.push(item);
  }

  console.log('\n📊 Plan Distribution:\n');
  
  const sortedPlans = Object.values(planCounts).sort((a, b) => b.count - a.count);
  
  for (const { count, plan, cases } of sortedPlans) {
    console.log(`  ${colorize(plan.plan_id, 'green')}: ${count} cases`);
    console.log(`    └─ ${plan.heading} (${plan.pricing.initialAmount})`);
    console.log('');
  }

  console.log(`\n📈 Total Test Cases: ${results.length}`);
  console.log(`📋 Unique Plans Shown: ${Object.keys(planCounts).length}`);
}

// ============================================================================
// TEST ENGINE
// ============================================================================

async function createEngine() {
  const engine = new Engine();
  
  for (const ruleConfig of PAYWALL_RULES) {
    const rule = new Rule(ruleConfig);
    engine.addRule(rule);
  }
  
  return engine;
}

async function runTests() {
  printHeader('PAYWALL RULES ENGINE - COMPREHENSIVE TEST');
  
  console.log('\n📋 Configuration:');
  console.log(`   Apps:          ${APP_IDS.join(', ')}`);
  console.log(`   User Types:    ${Object.values(USER_TYPES).join(', ')}`);
  console.log(`   Deeplinks:     ${Object.values(DEEPLINK_CAMPAIGNS).join(', ')}`);
  console.log(`   Total Plans:   ${Object.keys(PAYWALL_PLANS).length}`);
  console.log(`   Total Rules:   ${PAYWALL_RULES.length}`);
  console.log(`   Delay:         2 seconds between tests`);
  console.log(`   Strict Mode:   ${colorize('ENABLED', 'yellow')} (will fail on no match)`);

  const engine = await createEngine();
  const results = [];
  let failedCount = 0;

  // Generate all combinations
  const userTypes = Object.values(USER_TYPES);
  const deeplinks = Object.values(DEEPLINK_CAMPAIGNS);

  printHeader('TEST RESULTS BY APP');

  for (const appId of APP_IDS) {
    printSubHeader(`App: ${appId}`);
    
    for (const userType of userTypes) {
      for (const deeplink of deeplinks) {
        const context = { appId, userType, deeplink };
        
        // Run the rules engine
        const engineResult = await engine.run(context);
        
        // STRICT CHECK: Must have at least one matching event
        if (engineResult.events.length === 0) {
          console.log(colorize('\n❌ ERROR: No rules matched!', 'red'));
          console.log(colorize(`   Context: ${JSON.stringify(context)}`, 'red'));
          console.log(colorize('   This is a critical error - every case must match a rule!', 'red'));
          process.exit(1);
        }

        // Sort events by priority (highest first) and get the best match
        const sortedEvents = engineResult.events.sort((a, b) => {
          const priorityA = a.params?.priority || 0;
          const priorityB = b.params?.priority || 0;
          return priorityB - priorityA;
        });

        const matchedEvent = sortedEvents[0];
        
        // Build result
        const result = {
          plan: matchedEvent.params.plan,
          reason: matchedEvent.params.reason,
          ruleName: matchedEvent.type, // event.type contains the rule name
        };

        // Get expected result
        const expectedKey = `${userType}:${deeplink}`;
        const expected = EXPECTED_RESULTS[expectedKey];
        
        // Validate result
        let passed = true;
        if (expected) {
          passed = result.ruleName === expected.ruleName && result.plan.plan_id === expected.planId;
        }
        
        if (!passed) {
          failedCount++;
        }
        
        results.push({ testCase: context, result, passed, expected });
        printResult(context, result, passed, expected);
        
        // Wait 2 seconds before next test
        await sleep(2000);
      }
    }
  }

  printSummary(results, failedCount);
  
  // Print key scenarios
  printHeader('KEY SCENARIOS');
  
  const keyScenarios = [
    { name: 'New User (No Deeplink)', userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.NONE },
    { name: 'Abandoned Checkout', userType: USER_TYPES.ABANDONED, deeplink: DEEPLINK_CAMPAIGNS.NONE },
    { name: 'Churned User (Retargeting)', userType: USER_TYPES.CHURNED, deeplink: DEEPLINK_CAMPAIGNS.RETARGETING },
    { name: 'Marketing Campaign (Any User)', userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT },
    { name: 'Referral (Any User)', userType: USER_TYPES.ACTIVE, deeplink: DEEPLINK_CAMPAIGNS.REFERRAL },
    { name: 'Seasonal (Any User)', userType: USER_TYPES.EXPIRED, deeplink: DEEPLINK_CAMPAIGNS.SEASONAL },
    { name: 'Trial Expired', userType: USER_TYPES.TRIAL_EXPIRED, deeplink: DEEPLINK_CAMPAIGNS.NONE },
    { name: 'Marketing Trial (New User)', userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_TRIAL },
  ];

  for (const scenario of keyScenarios) {
    const matchingResult = results.find(
      r => r.testCase.userType === scenario.userType && 
           r.testCase.deeplink === scenario.deeplink &&
           r.testCase.appId === APP_IDS[0]
    );
    
    if (matchingResult) {
      const status = matchingResult.passed ? colorize('✓', 'green') : colorize('✗', 'red');
      console.log(`\n${status} 🎯 ${scenario.name}:`);
      console.log(`   Plan: ${colorize(matchingResult.result.plan.plan_id, matchingResult.passed ? 'green' : 'red')}`);
      console.log(`   Price: ${matchingResult.result.plan.pricing.initialAmount}`);
      console.log(`   Rule: ${colorize(matchingResult.result.ruleName, matchingResult.passed ? 'yellow' : 'red')}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  if (failedCount > 0) {
    console.log(colorize(`❌ TEST FAILED: ${failedCount} test(s) did not match expected results`, 'red'));
    console.log('='.repeat(80) + '\n');
    process.exit(1);
  } else {
    console.log(colorize('✅ ALL TESTS PASSED SUCCESSFULLY', 'green'));
    console.log('='.repeat(80) + '\n');
  }
}

// Run the tests
runTests().catch(err => {
  console.error(colorize('\n❌ FATAL ERROR:', 'red'), err);
  process.exit(1);
});