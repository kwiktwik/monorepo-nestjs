# User Migration Guide: kirana-fe to kwiktwik-kirana-be

This document describes the user migration system that migrates users from the legacy Flutter app (kirana-fe) to the new Kotlin app (kwiktwik-kirana-be) while keeping them logged in.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Migration Flow](#migration-flow)
3. [Backend Implementation](#backend-implementation)
4. [Android Implementation](#android-implementation)
5. [API Reference](#api-reference)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Android App (Kotlin)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Login Flow  │  │ Migration    │  │ New JWT Token    │  │
│  │  (BetterAuth)│  │ Service      │  │ Session          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────┬──────────────────┬────────────────────┘
                     │                  │
                     │ 1. POST /v1/auth/login/*
                     │    X-App-ID: com.kiranaapps.app
                     │                  │
                     ▼                  │
┌──────────────────────────────────────┐│
│   kwiktwik-kirana-be (NestJS)        ││
│  ┌────────────────────────────────┐  ││
│  │  Auth Service                  │  ││
│  │  - Detects kirana-fe user      │  ││
│  │  - Returns "needs_migration"   │  ││
│  └────────────────────────────────┘  ││
└────────────────────┬─────────────────┘│
                     │                  │
                     │ 2. Internal API Call
                     │    POST /api/internal/user/check
                     │    X-Internal-Key: ***
                     ▼                  │
┌──────────────────────────────────────┐│
│   kirana-fe (Next.js)                ││
│  ┌────────────────────────────────┐  ││
│  │  Internal Endpoints            │  ││
│  │  - /user/check                 │  ││
│  │  - /session/validate           │  ││
│  │  - /user/data                  │  ││
│  └────────────────────────────────┘  ││
└──────────────────────────────────────┘│
                     │                  │
                     │ 3. POST /v1/migration/migrate-session
                     │                  ▼
                     │     ┌──────────────────────────────┐
                     │     │   Migration Service          │
                     │     │   - Validate session         │
                     │     │   - Fetch source data        │
                     │     │   - Check partial data       │
                     │     │   - Migrate tables           │
                     │     │   - Verify hash              │
                     │     │   - Issue JWT                │
                     │     └──────────────────────────────┘
                     │                  │
                     │ 4. JWT Token Response
                     ▼                  │
┌──────────────────────────────────────┐│
│   Android App                        ││
│  ┌────────────────────────────────┐  ││
│  │  Store new JWT token           │  ││
│  │  Clear Better-Auth session     │  ││
│  │  Continue to app               │  ││
│  └────────────────────────────────┘  ││
└──────────────────────────────────────┘
```

### Key Design Principles

1. **User Experience First**: Users stay logged in during migration
2. **Atomic Operations**: All-or-nothing migration with rollback on failure
3. **Data Integrity**: SHA256 hash verification ensures data accuracy
4. **Security**: Internal APIs protected by API keys
5. **Audit Trail**: Every migration attempt logged in `migration_logs` table

---

## Migration Flow

### Step 1: User Detection

When a user tries to log in with phone number on the new app:

```
1. User enters phone number
2. POST /v1/auth/send-otp
3. Backend checks if user exists in kirana-fe via internal API
4. If exists → returns "kirana_user": true in response
5. OTP sent to user
```

### Step 2: Login Attempt

```
1. User enters OTP
2. POST /v1/auth/login/otp
3. Backend verifies OTP
4. Since "kirana_user" was true, backend returns:
   {
     "needs_migration": true,
     "session_token": "sess_abc123",  // Better-Auth session
     "phone": "+919876543210"
   }
5. Android app stores session_token temporarily
```

### Step 3: Migration

```
1. Android detects needs_migration = true
2. POST /v1/migration/migrate-session
   Headers:
     X-App-ID: com.kiranaapps.app
     Content-Type: application/json
   Body:
     {
       "betterAuthToken": "sess_abc123",
       "deviceId": "device_xyz789",
       "deviceInfo": {
         "brand": "Samsung",
         "model": "Galaxy S21",
         "os": "Android 13",
         "appVersion": "2.0.0"
       }
     }

3. Backend performs migration:
   - Validate Better-Auth session (calls kirana-fe)
   - Fetch all user data from kirana-fe
   - Check for partial data in destination
   - Calculate source hash
   - Migrate each table in order
   - Calculate destination hash
   - Verify hashes match
   - Issue JWT token

4. Backend returns:
   {
     "success": true,
     "migrationId": "mig_abc123",
     "token": "eyJhbG...",  // JWT for new system
     "user": "user_abc123",
     "migratedTables": ["user_metadata", "accounts", ...],
     "recordsMigrated": 15,
     "duration": 2345
   }
```

### Step 4: Completion

```
1. Android stores new JWT token
2. Clears temporary Better-Auth session
3. Redirects user to home screen
4. User is now logged in with new system
```

---

## Backend Implementation

### Database Schema

**migration_logs table:**
```sql
- id (text, PK)
- user_id (text)
- phone_number (text)
- source_app_id (text) - 'com.kiranaapps.app'
- destination_app_id (text) - 'com.kiranaapps.app'
- started_at (timestamp)
- completed_at (timestamp)
- duration (integer) - milliseconds
- status (text) - pending/completed/failed/timeout
- current_state (text) - current migration step
- retry_count (integer)
- source_hash (text) - SHA256 of source data
- destination_hash (text) - SHA256 of migrated data
- tables_migrated (jsonb) - array of table names
- tables_failed (jsonb) - array of failed tables
- records_count (integer)
- error_code (text)
- error_message (text)
- is_locked (boolean) - prevents concurrent migrations
- device_id (text)
- device_info (jsonb)
```

### Migration States

```
PENDING
  ↓
VALIDATING_SESSION → Check Better-Auth token validity
  ↓
FETCHING_SOURCE_DATA → Get all data from kirana-fe
  ↓
CHECKING_PARTIAL_DATA → Verify no existing data in destination
  ↓ (if partial data found → PARTIAL_DATA_DETECTED)
CALCULATING_HASH → Calculate source data hash
  ↓
MIGRATING_METADATA → Migrate user_metadata table
  ↓
MIGRATING_ACCOUNTS → Migrate accounts table
  ↓
MIGRATING_PUSH_TOKENS → Migrate pushTokens table
  ↓
MIGRATING_DEVICE_SESSIONS → Migrate deviceSessions table
  ↓
MIGRATING_USER_IMAGES → Migrate userImages table
  ↓
MIGRATING_PLAYSTORE_RATINGS → Migrate playStoreRatings table
  ↓
MIGRATING_SUBSCRIPTIONS → Migrate subscriptions table
  ↓
MIGRATING_ORDERS → Migrate orders table
  ↓
MIGRATING_ABANDONED_CHECKOUTS → Migrate abandonedCheckouts table
  ↓
MIGRATING_SUBSCRIPTION_LOGS → Migrate subscriptionLogs table
  ↓
MIGRATING_PHONEPE_ORDERS → Migrate phonepeOrders table
  ↓
MIGRATING_PHONEPE_SUBSCRIPTIONS → Migrate phonepeSubscriptions table
  ↓
VERIFYING_HASH → Calculate and compare hashes
  ↓
COMPLETED → Return JWT token

Alternative paths:
  ↓
FAILED → Error occurred, rolled back
  ↓
TIMEOUT → Migration took too long
  ↓
PARTIAL_DATA_DETECTED → Existing data found
```

### Table Migration Order

Tables are migrated in dependency order:

**Level 1 (No dependencies):**
- user_metadata
- accounts
- pushTokens

**Level 2 (Reference user only):**
- deviceSessions
- userImages
- playStoreRatings

**Level 3 (Business data):**
- subscriptions
- orders
- abandonedCheckouts

**Level 4 (Logs/History):**
- subscriptionLogs
- phonepeOrders
- phonepeSubscriptions

### Hash Verification

SHA256 hash is calculated on normalized data:
- Records sorted by ID for consistency
- Timestamps excluded (created_at, updated_at)
- Dates converted to ISO strings
- Keys sorted alphabetically

```typescript
// Hash calculation
sourceHash = SHA256(normalize(sourceData))
// Migrate data
// ...
destHash = SHA256(normalize(fetchedData))
assert(sourceHash === destHash)
```

### Rollback Mechanism

If migration fails at any step:
1. All already-inserted data is deleted in reverse order
2. Lock released
3. Error logged
4. User can retry later

---

## Android Implementation

### Kotlin Implementation

```kotlin
// MigrationService.kt
class MigrationService(
    private val apiClient: ApiClient,
    private val tokenManager: TokenManager,
    private val context: Context
) {
    companion object {
        const val APP_ID = "com.kiranaapps.app"
        const val TAG = "MigrationService"
    }

    /**
     * Handles the complete migration flow
     * Called when auth returns needs_migration = true
     */
    suspend fun migrateUser(
        betterAuthToken: String,
        deviceId: String
    ): Result<MigrationResponse> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Starting migration for device: $deviceId")
            
            // Get device info
            val deviceInfo = getDeviceInfo()
            
            // Create migration request
            val request = MigrateSessionRequest(
                betterAuthToken = betterAuthToken,
                deviceId = deviceId,
                deviceInfo = deviceInfo
            )
            
            // Call migration endpoint
            val response = apiClient.migrateSession(
                appId = APP_ID,
                request = request
            )
            
            if (response.success) {
                Log.d(TAG, "Migration successful: ${response.migrationId}")
                
                // Store new JWT token
                tokenManager.saveJwtToken(response.token)
                
                // Clear old Better-Auth session
                tokenManager.clearBetterAuthSession()
                
                // Log migration metrics
                logMigrationSuccess(response)
                
                Result.success(response)
            } else {
                Result.failure(
                    MigrationException(
                        response.error?.code ?: "ERR_UNKNOWN",
                        response.error?.message ?: "Migration failed"
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Migration failed", e)
            Result.failure(e)
        }
    }

    /**
     * Check migration status
     */
    suspend fun checkMigrationStatus(migrationId: String): MigrationStatus? {
        return try {
            apiClient.getMigrationStatus(APP_ID, migrationId)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check migration status", e)
            null
        }
    }

    /**
     * Get device information for migration tracking
     */
    private fun getDeviceInfo(): DeviceInfo {
        return DeviceInfo(
            brand = Build.BRAND ?: "Unknown",
            model = Build.MODEL ?: "Unknown",
            os = "Android ${Build.VERSION.RELEASE}",
            appVersion = getAppVersion()
        )
    }

    private fun getAppVersion(): String {
        return try {
            context.packageManager
                .getPackageInfo(context.packageName, 0)
                .versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }
    }

    private fun logMigrationSuccess(response: MigrationResponse) {
        // Log to analytics
        FirebaseAnalytics.getInstance(context).logEvent("user_migration_completed") {
            param("migration_id", response.migrationId)
            param("tables_migrated", response.migratedTables.size.toLong())
            param("records_migrated", response.recordsMigrated.toLong())
            param("duration_ms", response.duration.toLong())
        }
    }
}

// Data Classes
data class MigrateSessionRequest(
    val betterAuthToken: String,
    val deviceId: String,
    val deviceInfo: DeviceInfo
)

data class DeviceInfo(
    val brand: String,
    val model: String,
    val os: String,
    val appVersion: String
)

data class MigrationResponse(
    val success: Boolean,
    val migrationId: String,
    val token: String,
    val user: String,
    val migratedTables: List<String>,
    val recordsMigrated: Int,
    val duration: Long,
    val error: MigrationError? = null
)

data class MigrationError(
    val code: String,
    val message: String,
    val details: ErrorDetails? = null
)

data class ErrorDetails(
    val tablesWithData: List<String>? = null
)

class MigrationException(
    val code: String,
    override val message: String
) : Exception(message)
```

### Repository/ApiClient

```kotlin
// ApiClient.kt
interface ApiService {
    @POST("v1/auth/send-otp")
    suspend fun sendOtp(
        @Header("X-App-ID") appId: String,
        @Body request: SendOtpRequest
    ): OtpResponse

    @POST("v1/auth/login/otp")
    suspend fun loginWithOtp(
        @Header("X-App-ID") appId: String,
        @Body request: LoginOtpRequest
    ): LoginResponse

    @POST("v1/migration/migrate-session")
    suspend fun migrateSession(
        @Header("X-App-ID") appId: String,
        @Body request: MigrateSessionRequest
    ): MigrationResponse

    @GET("v1/migration/status/{migrationId}")
    suspend fun getMigrationStatus(
        @Header("X-App-ID") appId: String,
        @Path("migrationId") migrationId: String
    ): MigrationStatus
}

class ApiClient(private val apiService: ApiService) {
    suspend fun migrateSession(
        appId: String,
        request: MigrateSessionRequest
    ): MigrationResponse {
        return apiService.migrateSession(appId, request)
    }

    suspend fun getMigrationStatus(
        appId: String,
        migrationId: String
    ): MigrationStatus {
        return apiService.getMigrationStatus(appId, migrationId)
    }
}
```

### ViewModel Integration

```kotlin
// AuthViewModel.kt
class AuthViewModel(
    private val authRepository: AuthRepository,
    private val migrationService: MigrationService
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    fun loginWithOtp(phone: String, otp: String, deviceId: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading

            try {
                val response = authRepository.loginWithOtp(phone, otp)

                if (response.needsMigration) {
                    // User needs migration
                    _authState.value = AuthState.Migrating
                    
                    // Perform migration
                    val migrationResult = migrationService.migrateUser(
                        betterAuthToken = response.sessionToken!!,
                        deviceId = deviceId
                    )

                    migrationResult
                        .onSuccess { 
                            _authState.value = AuthState.Authenticated(it.token)
                        }
                        .onFailure { error ->
                            handleMigrationError(error)
                        }
                } else {
                    // Normal login, no migration needed
                    _authState.value = AuthState.Authenticated(response.token!!)
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Login failed")
            }
        }
    }

    private fun handleMigrationError(error: Throwable) {
        when {
            error is MigrationException && error.code == "ERR_PARTIAL_001" -> {
                // Partial data detected - user has data in new system
                _authState.value = AuthState.Error(
                    "Account conflict detected. Please contact support with error code: ERR_PARTIAL_001"
                )
            }
            error is MigrationException && error.code == "ERR_SESSION_002" -> {
                // Session expired
                _authState.value = AuthState.Error(
                    "Session expired. Please login again."
                )
            }
            else -> {
                _authState.value = AuthState.Error(
                    "Migration failed. Please try again or contact support."
                )
            }
        }
    }
}

// Auth States
sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object Migrating : AuthState()
    data class Authenticated(val token: String) : AuthState()
    data class Error(val message: String) : AuthState()
}
```

### UI Implementation

```kotlin
// MigrationScreen.kt
@Composable
fun MigrationScreen(
    viewModel: AuthViewModel = hiltViewModel(),
    onMigrationComplete: () -> Unit,
    onError: (String) -> Unit
) {
    val authState by viewModel.authState.collectAsState()

    when (authState) {
        is AuthState.Migrating -> {
            MigrationProgressDialog()
        }
        is AuthState.Authenticated -> {
            LaunchedEffect(Unit) {
                onMigrationComplete()
            }
        }
        is AuthState.Error -> {
            LaunchedEffect(Unit) {
                onError((authState as AuthState.Error).message)
            }
        }
        else -> { /* Handle other states */ }
    }
}

@Composable
fun MigrationProgressDialog() {
    AlertDialog(
        onDismissRequest = { /* Don't allow dismiss */ },
        title = { Text("Migrating Account") },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "Transferring your data to the new app...",
                    textAlign = TextAlign.Center
                )
                Text(
                    "This may take a few seconds",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = { }
    )
}
```

### Token Manager

```kotlin
// TokenManager.kt
class TokenManager(private val sharedPreferences: SharedPreferences) {
    companion object {
        private const val KEY_JWT_TOKEN = "jwt_token"
        private const val KEY_BETTER_AUTH_TOKEN = "better_auth_token"
    }

    fun saveJwtToken(token: String) {
        sharedPreferences.edit()
            .putString(KEY_JWT_TOKEN, token)
            .apply()
    }

    fun getJwtToken(): String? {
        return sharedPreferences.getString(KEY_JWT_TOKEN, null)
    }

    fun saveBetterAuthSession(token: String) {
        sharedPreferences.edit()
            .putString(KEY_BETTER_AUTH_TOKEN, token)
            .apply()
    }

    fun getBetterAuthSession(): String? {
        return sharedPreferences.getString(KEY_BETTER_AUTH_TOKEN, null)
    }

    fun clearBetterAuthSession() {
        sharedPreferences.edit()
            .remove(KEY_BETTER_AUTH_TOKEN)
            .apply()
    }

    fun clearAll() {
        sharedPreferences.edit()
            .remove(KEY_JWT_TOKEN)
            .remove(KEY_BETTER_AUTH_TOKEN)
            .apply()
    }

    fun isLoggedIn(): Boolean {
        return getJwtToken() != null
    }
}
```

---

## API Reference

### Authentication Endpoints

#### POST /v1/auth/send-otp
Send OTP to phone number with kirana-fe user detection.

**Request:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "kirana_user": true,  // true if user exists in old app
  "expiresIn": 600
}
```

#### POST /v1/auth/login/otp
Login with OTP. Returns migration info if user needs migration.

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "deviceId": "device_xyz789"
}
```

**Response (needs migration):**
```json
{
  "success": true,
  "needs_migration": true,
  "session_token": "sess_abc123",
  "phone": "+919876543210",
  "message": "Please migrate your account"
}
```

**Response (normal login):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc123",
    "phone": "+919876543210"
  }
}
```

### Migration Endpoints

#### POST /v1/migration/migrate-session
Initiate user migration from kirana-fe.

**Headers:**
- `X-App-ID`: com.kiranaapps.app (required)
- `Content-Type`: application/json

**Request:**
```json
{
  "betterAuthToken": "sess_abc123",
  "deviceId": "device_xyz789",
  "deviceInfo": {
    "brand": "Samsung",
    "model": "Galaxy S21",
    "os": "Android 13",
    "appVersion": "2.0.0"
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "migrationId": "mig_abc123def456",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": "user_abc123",
  "migratedTables": [
    "user_metadata",
    "accounts",
    "pushTokens",
    "deviceSessions",
    "userImages",
    "subscriptions",
    "orders"
  ],
  "recordsMigrated": 15,
  "duration": 2345
}
```

**Error Response (Partial Data):**
```json
{
  "statusCode": 400,
  "code": "ERR_PARTIAL_001",
  "message": "Migration cannot proceed. Existing data found in tables: orders, subscriptions. Please contact support team with error code: ERR_PARTIAL_001",
  "details": {
    "tablesWithData": ["orders", "subscriptions"]
  }
}
```

#### GET /v1/migration/status/{migrationId}
Check migration status.

**Response:**
```json
{
  "migrationId": "mig_abc123",
  "userId": "user_abc123",
  "phoneNumber": "+919876543210",
  "status": "completed",
  "currentState": "completed",
  "startedAt": "2026-03-09T10:30:00Z",
  "completedAt": "2026-03-09T10:30:02Z",
  "duration": 2345,
  "tablesMigrated": ["user_metadata", "accounts"],
  "recordsCount": 15,
  "sourceHash": "a1b2c3...",
  "destinationHash": "a1b2c3...",
  "deviceId": "device_xyz789"
}
```

---

## Error Handling

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `ERR_PARTIAL_001` | Existing data found in destination | Contact support |
| `ERR_SESSION_002` | Invalid/expired Better-Auth session | Re-login |
| `ERR_HASH_003` | Data verification failed | Retry migration |
| `ERR_TIMEOUT_004` | Migration timed out | Retry migration |
| `ERR_MAX_RETRY_005` | Max retries exceeded | Contact support |
| `ERR_FK_006` | Foreign key constraint violation | Contact support |
| `ERR_INTEGRITY_007` | Data integrity error | Contact support |
| `ERR_UNKNOWN_999` | Unknown error | Retry or contact support |

### Retry Strategy

Android app should implement exponential backoff:

```kotlin
// Retry with exponential backoff
suspend fun <T> retryWithBackoff(
    maxAttempts: Int = 3,
    initialDelay: Long = 2000,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(maxAttempts - 1) { attempt ->
        try {
            return block()
        } catch (e: Exception) {
            if (e is MigrationException && 
                e.code in listOf("ERR_PARTIAL_001", "ERR_SESSION_002")) {
                throw e // Don't retry these
            }
            delay(currentDelay)
            currentDelay *= 2
        }
    }
    return block() // Last attempt
}
```

---

## Security Considerations

### Internal API Security

1. **API Keys**: All internal endpoints require `X-Internal-Key` header
2. **App ID Validation**: All endpoints validate `X-App-ID` header
3. **Rate Limiting**: Migration endpoints should have rate limits (20/hour recommended)
4. **Token Expiry**: Better-Auth sessions expire (default 7 days)

### Data Protection

1. **Hash Verification**: SHA256 hash ensures data integrity
2. **Rollback**: Failed migrations automatically rollback
3. **Locking**: DB-based locks prevent concurrent migrations
4. **Audit Logs**: All migration attempts logged with full details

### Network Security

1. **HTTPS Only**: All API calls must use HTTPS
2. **Certificate Pinning**: Recommended for production
3. **Request Signing**: Consider signing migration requests

---

## Testing Checklist

### Backend Testing

- [ ] Send OTP detects kirana-fe users
- [ ] Login returns `needs_migration` flag
- [ ] Migration validates Better-Auth session
- [ ] Migration fetches all user data
- [ ] Partial data detection works
- [ ] Hash calculation is consistent
- [ ] Rollback deletes inserted data
- [ ] JWT token issued on success
- [ ] Status endpoint returns correct info
- [ ] Stale migration cleanup works

### Android Testing

- [ ] OTP flow detects migration need
- [ ] Migration screen shows correctly
- [ ] Device info collected properly
- [ ] JWT token stored after migration
- [ ] Old session cleared after migration
- [ ] Error handling shows correct messages
- [ ] Retry logic works correctly
- [ ] Progress indicator displays
- [ ] App redirects after migration
- [ ] Token manager handles both token types

### Integration Testing

- [ ] End-to-end happy path
- [ ] Partial data scenario
- [ ] Network failure during migration
- [ ] Session expiry during migration
- [ ] Concurrent migration attempts
- [ ] Large data migration (many records)
- [ ] Migration after app update

---

## Monitoring & Alerts

### Metrics to Track

- Migration success rate
- Average migration duration
- Tables migrated per user
- Error rates by error code
- Retry counts
- Device info distribution

### Alerts

- Migration failure rate > 5%
- Average duration > 10 seconds
- Stale migrations accumulating
- Internal API errors

---

## Deployment Checklist

### Before Launch

1. ✅ Database migration applied
2. ✅ Internal API endpoints secured
3. ✅ Environment variables set:
   - `INTERNAL_API_KEY`
   - `KIRANA_FE_BASE_URL`
   - `MIGRATION_TIMEOUT_MS`
   - `MIGRATION_MAX_RETRIES`
4. ✅ Android app updated with migration flow
5. ✅ Error messages localized
6. ✅ Support team trained on error codes
7. ✅ Monitoring dashboards set up
8. ✅ Rollback plan documented

### Post-Launch

1. Monitor migration success rates
2. Track user feedback
3. Optimize migration performance
4. Update documentation based on issues

---

## Support Playbook

### User Reports: "Migration Failed"

1. Check migration_logs table for user's phone
2. Identify error code
3. Guide user based on error:
   - `ERR_PARTIAL_001`: Manual data merge required
   - `ERR_SESSION_002`: Ask user to re-login
   - `ERR_TIMEOUT_004`: Retry migration
   - Others: Escalate to engineering

### Common Issues

**Issue**: "Session expired during migration"
- **Cause**: User took too long or session expired
- **Fix**: Re-login and retry

**Issue**: "Existing data found"
- **Cause**: User created account on new app before migration
- **Fix**: Contact support for manual merge

**Issue**: "Migration timeout"
- **Cause**: Too much data or slow network
- **Fix**: Retry on better network

---

## Appendix

### Environment Variables

```bash
# kwiktwik-kirana-be
KIRANA_FE_BASE_URL=https://api.kiranaapps.com
INTERNAL_API_KEY=your-secret-key-here
MIGRATION_TIMEOUT_MS=60000
MIGRATION_MAX_RETRIES=3
MIGRATION_HEARTBEAT_INTERVAL_MS=30000
MIGRATION_STALE_THRESHOLD_MS=300000

# kirana-fe
INTERNAL_API_KEY=your-secret-key-here  # Same as above
```

### Database Migration

```sql
-- Run this SQL to create migration_logs table
-- File: drizzle/0005_create_migration_logs.sql
-- Already included in codebase, run: npm run db:push
```

---

**Document Version**: 1.0
**Last Updated**: 2026-03-09
**Maintained By**: Backend Team
