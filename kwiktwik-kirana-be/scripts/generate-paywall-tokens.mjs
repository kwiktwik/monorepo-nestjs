#!/usr/bin/env node
/**
 * Generate Paywall Test Tokens
 * 
 * This script generates JWT tokens for testing the paywall rules engine.
 * Each token contains userType and deeplink claims that the rules engine uses.
 * 
 * Usage:
 *   node scripts/generate-paywall-tokens.mjs
 * 
 * Output:
 *   Creates test_paywall.md with all token combinations
 */

import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// JWT Secret - must match the one in jwt.strategy.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Configuration
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

// Generate a token for a specific user type and deeplink
function generateToken(appId, userType, deeplink) {
  const userId = `test_${nanoid(8)}`;
  
  const payload = {
    sub: userId,
    appId,
    userType,
    deeplink,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

// Generate markdown content
function generateMarkdown() {
  let md = `# Paywall Test Tokens

Use these JWT tokens in Swagger UI to test different paywall configurations.

## How to Use

1. Start the mock server:
   \`\`\`bash
   cd kwiktwik-kirana-be
   pnpm start:dev:mock
   \`\`\`

2. Open Swagger UI: http://localhost:4010/docs or http://localhost:4010/mock-docs

3. Click "Authorize" button

4. Paste the JWT token for the desired user type and deeplink

5. Call \`GET /api/config/v2\` with optional query parameters:
   - \`userType\`: Override the user type from token
   - \`deeplink\`: Override the deeplink from token

## Expected Results

| User Type | Deeplink | Expected Plan | Price |
|-----------|----------|---------------|-------|
| new | none | Welcome Offer | ₹99 |
| new | marketing_50_percent | Marketing Campaign | ₹79 |
| new | marketing_trial | Trial Expired | ₹59 |
| new | referral | Welcome Offer | ₹99 |
| new | seasonal | Marketing Campaign | ₹79 |
| active | none | Standard | ₹199 |
| active | marketing_50_percent | Marketing Campaign | ₹79 |
| active | referral | Welcome Offer | ₹99 |
| abandoned | none | Abandoned Checkout | ₹49 |
| abandoned | marketing_50_percent | Marketing Campaign | ₹79 |
| trial_expired | none | Trial Expired | ₹59 |
| trial_expired | marketing_trial | Trial Expired | ₹59 |
| churned | none | Loyal User | ₹149 |
| churned | retargeting | Abandoned Checkout | ₹49 |
| expired | none | Loyal User | ₹149 |

---

`;

  for (const appId of APP_IDS) {
    md += `## App: ${appId}\n\n`;
    
    // Create a simplified table with just key tokens
    md += '### Quick Reference Tokens\n\n';
    md += '| User Type | Deeplink | JWT Token |\n';
    md += '|-----------|----------|-----------|\n';
    
    // Generate tokens for key combinations
    const keyCombinations = [
      { userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.NONE, label: 'New User (Default)' },
      { userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT, label: 'New User + Marketing' },
      { userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.REFERRAL, label: 'New User + Referral' },
      { userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.SEASONAL, label: 'New User + Seasonal' },
      { userType: USER_TYPES.NEW, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_TRIAL, label: 'New User + Trial Campaign' },
      { userType: USER_TYPES.ACTIVE, deeplink: DEEPLINK_CAMPAIGNS.NONE, label: 'Active User' },
      { userType: USER_TYPES.ACTIVE, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT, label: 'Active + Marketing' },
      { userType: USER_TYPES.ABANDONED, deeplink: DEEPLINK_CAMPAIGNS.NONE, label: 'Abandoned Checkout' },
      { userType: USER_TYPES.ABANDONED, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT, label: 'Abandoned + Marketing' },
      { userType: USER_TYPES.TRIAL_EXPIRED, deeplink: DEEPLINK_CAMPAIGNS.NONE, label: 'Trial Expired' },
      { userType: USER_TYPES.TRIAL_EXPIRED, deeplink: DEEPLINK_CAMPAIGNS.MARKETING_TRIAL, label: 'Trial + Marketing Trial' },
      { userType: USER_TYPES.CHURNED, deeplink: DEEPLINK_CAMPAIGNS.NONE, label: 'Churned User' },
      { userType: USER_TYPES.CHURNED, deeplink: DEEPLINK_CAMPAIGNS.RETARGETING, label: 'Churned + Retargeting' },
      { userType: USER_TYPES.EXPIRED, deeplink: DEEPLINK_CAMPAIGNS.NONE, label: 'Expired Subscription' },
    ];

    for (const combo of keyCombinations) {
      const token = generateToken(appId, combo.userType, combo.deeplink);
      md += `| ${combo.userType} | ${combo.deeplink} | \`${token}\` |\n`;
    }

    md += '\n### All Combinations\n\n';
    md += '<details>\n<summary>Click to expand all tokens</summary>\n\n';
    md += '| User Type | Deeplink | JWT Token |\n';
    md += '|-----------|----------|-----------|\n';

    for (const userType of Object.values(USER_TYPES)) {
      for (const deeplink of Object.values(DEEPLINK_CAMPAIGNS)) {
        const token = generateToken(appId, userType, deeplink);
        md += `| ${userType} | ${deeplink} | \`${token}\` |\n`;
      }
    }
    md += '\n</details>\n\n';
  }

  md += `---

## Testing with cURL

\`\`\`bash
# Test new user with no deeplink
curl -X GET "http://localhost:4010/api/config/v2" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-App-ID: com.paymentalert.app"

# Test with query parameter override
curl -X GET "http://localhost:4010/api/config/v2?userType=abandoned&deeplink=none" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-App-ID: com.paymentalert.app"
\`\`\`

## Token Payload Structure

Each token contains the following claims:
- \`sub\`: Unique user ID
- \`appId\`: Application identifier
- \`userType\`: User segmentation type
- \`deeplink\`: Marketing campaign source

## Notes

- Tokens expire after 30 days
- The default JWT secret is \`your-secret-key-change-this\`
- For production, set \`JWT_SECRET\` environment variable
- Query parameters (\`userType\`, \`deeplink\`) override token claims
`;

  return md;
}

// Main
const markdown = generateMarkdown();
const outputPath = resolve(packageRoot, 'test_paywall.md');
writeFileSync(outputPath, markdown, 'utf8');

console.log('✅ Generated test_paywall.md with all JWT tokens');
console.log(`📍 Location: ${outputPath}`);
console.log('\n📋 Usage:');
console.log('   1. Start mock server: pnpm start:dev:mock');
console.log('   2. Open http://localhost:4010/docs');
console.log('   3. Copy a token from test_paywall.md');
console.log('   4. Click Authorize and paste the token');
console.log('   5. Call GET /api/config/v2');
