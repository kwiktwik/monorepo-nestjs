# Secure PhonePe Environment Toggle for Android

Secure way to switch between development and production PhonePe environments. Only team members can access production mode.

## 🚀 Quick Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Development (Sandbox)
PHONEPE_MERCHANT_ID_DEV=PGTESTPAYUAT
PHONEPE_SALT_KEY_DEV=
PHONEPE_SALT_INDEX_DEV=1

# Production (Live)
PHONEPE_MERCHANT_ID_PROD=YOUR_PROD_MERCHANT_ID
PHONEPE_SALT_KEY_PROD=YOUR_PROD_SALT_KEY
PHONEPE_SALT_INDEX_PROD=1

# Team member IDs (comma-separated)
TEAM_MEMBER_IDS=user_id_1,user_id_2,user_id_3
```

### 2. Update PhonePe API

```tsx
import { getCurrentEnvironment, getPhonePeConfig } from '@/lib/phonepe-env';

// In your PhonePe API route
export async function POST(request: NextRequest) {
  const env = getCurrentEnvironment(request);
  const config = getPhonePeConfig(env);
  
  // Use config for PhonePe API calls
  console.log(`Using ${env} environment: ${config.merchantId}`);
}
```

## 📱 Android Integration

### Method 1: Query Parameter

```bash
# Development (Sandbox)
POST https://yourapp.com/api/phonepe?env=DEV

# Production (Live)
POST https://yourapp.com/api/phonepe?env=PROD
```

### Method 2: HTTP Header

```bash
# Development (Sandbox)
POST https://yourapp.com/api/phonepe
Headers:
  X-PhonePe-Env: DEV

# Production (Live)
POST https://yourapp.com/api/phonepe
Headers:
  X-PhonePe-Env: PROD
```

### Method 3: App Setting Toggle

```java
// In your Android app
public void setPhonePeEnvironment(boolean isProduction) {
    String env = isProduction ? "PROD" : "DEV";
    
    // Add to all PhonePe API requests
    Request request = new Request.Builder()
        .url("https://yourapp.com/api/phonepe")
        .addHeader("X-PhonePe-Env", env)
        .build();
}
```

## 🔧 Usage Examples

### Retrofit Example (Android)

```java
public interface PhonePeApi {
    @POST("/api/phonepe")
    @Headers({
        "Content-Type: application/json"
    })
    Call<PhonePeResponse> createSubscription(
        @Body SubscriptionRequest request,
        @Header("X-PhonePe-Env") String environment
    );
}

// Usage
String env = isDebugMode ? "DEV" : "PROD";
phonePeApi.createSubscription(request, env);
```

### Volley Example (Android)

```java
StringRequest stringRequest = new StringRequest(
    Request.Method.POST,
    "https://yourapp.com/api/phonepe",
    response -> {
        // Handle response
    },
    error -> {
        // Handle error
    }
) {
    @Override
    public Map<String, String> getHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("X-PhonePe-Env", isProduction ? "PROD" : "DEV");
        return headers;
    }
};
```

## 🛡️ Security Features

### **Team Member Authentication**
Only users with IDs in `TEAM_MEMBER_IDS` can switch environments:

```bash
# Only team members can use ?env=PROD or X-PhonePe-Env: PROD
# Others will get 403 Forbidden error
```

### **Automatic Security Check**
```tsx
// In your API route
const env = await getCurrentEnvironment(request, userId);
if (!canAccessProduction(request, userId)) {
  return NextResponse.json(
    { error: "Unauthorized: Production access restricted to team members" },
    { status: 403 }
  );
}
```

## 🎯 How It Works

1. **Default**: Development mode (`DEV`) in development server, Production mode (`PROD`) in production
2. **Team Member Check**: Only `TEAM_MEMBER_IDS` can override environment
3. **Query Parameter**: `?env=DEV` or `?env=PROD` (team members only)
4. **HTTP Header**: `X-PhonePe-Env: DEV` or `X-PhonePe-Env: PROD` (team members only)
5. **Priority**: Header > Query Parameter > Default
6. **Security**: Non-team members always get default environment

## ✅ Benefits

- **Secure**: Only team members can access production
- **Simple**: No complex APIs or databases
- **Android-Friendly**: Works with headers/query params
- **Type Safe**: Full TypeScript support
- **Zero Dependencies**: Just one small file
- **Audit Trail**: Logs who switched environments

## 🔍 Testing

### **Team Member Testing**
```bash
# Test development mode (works for everyone)
curl -X POST https://yourapp.com/api/phonepe \
  -H "X-PhonePe-Env: DEV" \
  -d '{"action":"create-order","amount":100,"redirectUrl":"https://example.com/callback"}'

# Test production mode (team members only)
curl -X POST https://yourapp.com/api/phonepe \
  -H "Authorization: Bearer YOUR_TEAM_MEMBER_TOKEN" \
  -H "X-PhonePe-Env: PROD" \
  -d '{"action":"create-order","amount":100,"redirectUrl":"https://example.com/callback"}'
```

### **Non-Team Member Testing**
```bash
# This will return 403 Forbidden
curl -X POST https://yourapp.com/api/phonepe \
  -H "X-PhonePe-Env: PROD" \
  -d '{"action":"create-order","amount":100,"redirectUrl":"https://example.com/callback"}'

# Response:
# {"error":"Unauthorized: Production access restricted to team members"}
```

## ⚠️ Important Security Notes

- **Never expose `TEAM_MEMBER_IDS`** in client-side code
- **Always validate authentication** before checking environment permissions
- **Use HTTPS** for all API calls
- **Regularly rotate** team member IDs and credentials
- **Monitor logs** for unauthorized access attempts

## 🚀 Ready for Production

Your secure environment toggle is now ready! Team members can safely test both environments while non-team users are restricted to development mode only.