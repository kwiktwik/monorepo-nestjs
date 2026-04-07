/**
 * migrate-users-from-kirana-fe.mjs
 *
 * Migrates users from kirana-fe (Supabase) → kwiktwik-kirana-be (RDS/Postgres).
 *
 * Migrated tables (per user):
 *   user, account, user_metadata, subscriptions, phonepe_subscriptions,
 *   orders, push_tokens, device_sessions, play_store_ratings,
 *   abandoned_checkouts, user_images
 *
 * Each run writes a row to `migration_logs` in the destination DB, tracking
 * status, records_count, tables_migrated, errors, etc.
 *
 * ──────────────────────────────────────────────────────────────
 * USAGE
 * ──────────────────────────────────────────────────────────────
 *   node scripts/migrate-users-from-kirana-fe.mjs [options]
 *
 * Options:
 *   --filter=all          Migrate all users (default)
 *   --filter=premium      Only users with an active subscription
 *   --filter=non-premium  Only users without any active subscription
 *
 *   --percent=N           Migrate only N % of selected users (1-100, default 100)
 *
 *   --from-date=YYYY-MM-DD  Only include users updated on or after this date
 *   --to-date=YYYY-MM-DD    Only include users updated on or before this date
 *                           (both are optional and can be combined)
 *
 *   --app-id=<id>         Scope migration to a specific app ID (optional).
 *                         If omitted, all apps are included and app_id filter is skipped.
 *   --batch-size=N        Rows per DB round-trip (default 100)
 *   --dry-run             Print what would be migrated without touching the target DB
 *
 * Examples:
 *   # Migrate 1% of all users — good for smoke-testing
 *   node scripts/migrate-users-from-kirana-fe.mjs --filter=all --percent=1 --dry-run
 *
 *   # Migrate all premium users registered in Jan 2025
 *   node scripts/migrate-users-from-kirana-fe.mjs \
 *     --filter=premium --from-date=2025-01-01 --to-date=2025-01-31
 *
 *   # Migrate 10% of non-premium users
 *   node scripts/migrate-users-from-kirana-fe.mjs --filter=non-premium --percent=10
 *
 * ──────────────────────────────────────────────────────────────
 * ENV VARS (in .env.local)
 * ──────────────────────────────────────────────────────────────
 *   SOURCE_DATABASE_URL   — kirana-fe Supabase Postgres connection string
 *   DATABASE_URL          — kwiktwik-kirana-be target DB connection string
 *
 * If SOURCE_DATABASE_URL is not set, falls back to reading ../kirana-fe/.env
 * and using the DATABASE_URL found there as the source.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';
import crypto from 'crypto';

// ─── ENV LOADING ─────────────────────────────────────────────────────────────

const envPath = process.env.DOTENV_CONFIG_PATH || '.env.local';

function loadEnv(filePath) {
  try {
    const content = readFileSync(resolve(process.cwd(), filePath), 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch { /* ignore missing files */ }
}

loadEnv(envPath);

// Fallback: try reading kirana-fe's .env to get source DB URL
if (!process.env.SOURCE_DATABASE_URL) {
  const savedDestUrl = process.env.DATABASE_URL;
  loadEnv('../kirana-fe/.env');
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== savedDestUrl) {
    process.env.SOURCE_DATABASE_URL = process.env.DATABASE_URL;
  }
  // Restore destination URL
  if (savedDestUrl) process.env.DATABASE_URL = savedDestUrl;
  else loadEnv(envPath);
}

// ─── ARGUMENT PARSING ────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2); ``
  const opts = {
    filter: 'all',   // 'all' | 'premium' | 'non-premium'
    percent: 100,     // 1-100
    fromDate: null,    // ISO date string or null
    toDate: null,    // ISO date string or null
    appId: null,    // REQUIRED — must be passed via --app-id=
    batchSize: 100,
    dryRun: false,
  };

  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, '').split('=');
    switch (key) {
      case 'filter': opts.filter = val; break;
      case 'percent': opts.percent = Number(val); break;
      case 'from-date': opts.fromDate = val; break;
      case 'to-date': opts.toDate = val; break;
      case 'app-id': opts.appId = val; break;
      case 'batch-size': opts.batchSize = Number(val); break;
      case 'dry-run': opts.dryRun = true; break;
    }
  }

  if (!['all', 'premium', 'non-premium'].includes(opts.filter)) {
    console.error(`Invalid --filter="${opts.filter}". Must be: all | premium | non-premium`);
    process.exit(1);
  }
  if (opts.percent < 1 || opts.percent > 100 || isNaN(opts.percent)) {
    console.error('--percent must be a number between 1 and 100');
    process.exit(1);
  }
  if (opts.fromDate && isNaN(Date.parse(opts.fromDate))) {
    console.error(`--from-date="${opts.fromDate}" is not a valid date (use YYYY-MM-DD)`);
    process.exit(1);
  }
  if (opts.toDate && isNaN(Date.parse(opts.toDate))) {
    console.error(`--to-date="${opts.toDate}" is not a valid date (use YYYY-MM-DD)`);
    process.exit(1);
  }
  if (!opts.appId) {
    console.warn('[WARN] --app-id not provided. No app_id filter will be applied (all apps included).');
  }

  return opts;
}

// ─── DB HELPERS ──────────────────────────────────────────────────────────────

function buildPoolOpts(url) {
  // Always enable SSL — RDS requires it (even through SSH tunnel) and Supabase requires it.
  // rejectUnauthorized:false handles cert hostname mismatch when tunnelling via localhost.
  return {
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  };
}

// ─── ACTIVE SUBSCRIPTION CONSTANTS ──────────────────────────────────────────

const ACTIVE_RAZORPAY_STATUSES = ['active', 'authenticated'];
const ACTIVE_PHONEPE_STATES = ['ACTIVE', 'ACTIVATED', 'AUTHENTICATED'];

// ─── FETCH CANDIDATE USER IDs ────────────────────────────────────────────────

// Tables that carry an app_id column (used to scope per-app data)
const TABLES_WITH_APP_ID = new Set([
  'subscriptions', 'phonepe_subscriptions', 'orders', 'push_tokens',
  'device_sessions', 'play_store_ratings', 'abandoned_checkouts',
  'user_images', 'user_metadata',
]);

async function fetchCandidateUserIds(src, opts) {
  const p = [];
  let pi = 1;

  // Bind subscription status arrays only for queries that use them.
  let $razStatuses = null;
  let $ppStatuses = null;
  if (opts.filter !== 'all') {
    p.push(ACTIVE_RAZORPAY_STATUSES); $razStatuses = `$${pi++}`;
    p.push(ACTIVE_PHONEPE_STATES); $ppStatuses = `$${pi++}`;
  }

  // app_id is optional — only add filter when explicitly provided
  let $appId = null;
  if (opts.appId) { p.push(opts.appId); $appId = `$${pi++}`; }
  const appAnd = $appId ? `AND s.app_id = ${$appId}` : '';
  const appAndP = $appId ? `AND ps.app_id = ${$appId}` : '';
  const appAndO = $appId ? `AND o.app_id = ${$appId}` : '';
  const appAndT = $appId ? `AND pt.app_id = ${$appId}` : '';

  const dc = [];
  if (opts.fromDate) { p.push(opts.fromDate); dc.push(`u."updatedAt" >= $${pi++}::timestamptz`); }
  if (opts.toDate) { p.push(opts.toDate + ' 23:59:59'); dc.push(`u."updatedAt" <= $${pi++}::timestamptz`); }
  const dw = dc.length ? 'AND ' + dc.join(' AND ') : '';

  let sql;

  if (opts.filter === 'all') {
    if ($appId) {
      // Scope to users who have at least one record for this app
      sql = `
        SELECT DISTINCT u.id FROM "user" u
        WHERE (
          EXISTS (SELECT 1 FROM subscriptions s         WHERE s.user_id = u.id ${appAnd})
          OR EXISTS (SELECT 1 FROM phonepe_subscriptions ps WHERE ps.user_id = u.id ${appAndP})
          OR EXISTS (SELECT 1 FROM orders o              WHERE o.user_id = u.id ${appAndO})
          OR EXISTS (SELECT 1 FROM push_tokens pt        WHERE pt.user_id = u.id ${appAndT})
        )
        ${dw} ORDER BY u.id
      `;
    } else {
      sql = `SELECT u.id FROM "user" u WHERE 1=1 ${dw} ORDER BY u."updatedAt"`;
    }

  } else if (opts.filter === 'premium') {
    sql = `
      SELECT DISTINCT u.id FROM "user" u
      WHERE (
        EXISTS (SELECT 1 FROM subscriptions s         WHERE s.user_id = u.id ${appAnd}  AND s.status::text = ANY(${$razStatuses}::text[]))
        OR EXISTS (SELECT 1 FROM phonepe_subscriptions ps WHERE ps.user_id = u.id ${appAndP} AND ps.state::text  = ANY(${$ppStatuses}::text[]))
      )
      ${dw} ORDER BY u.id
    `;

  } else { // non-premium: has app data but no active subscription
    const hasData = $appId ? `(
        EXISTS (SELECT 1 FROM subscriptions s      WHERE s.user_id = u.id ${appAnd})
        OR EXISTS (SELECT 1 FROM phonepe_subscriptions ps WHERE ps.user_id = u.id ${appAndP})
        OR EXISTS (SELECT 1 FROM orders o           WHERE o.user_id = u.id ${appAndO})
        OR EXISTS (SELECT 1 FROM push_tokens pt     WHERE pt.user_id = u.id ${appAndT})
      ) AND` : '';
    sql = `
      SELECT DISTINCT u.id FROM "user" u
      WHERE ${hasData}
        NOT EXISTS (SELECT 1 FROM subscriptions s         WHERE s.user_id = u.id ${appAnd}  AND s.status::text = ANY(${$razStatuses}::text[]))
        AND NOT EXISTS (SELECT 1 FROM phonepe_subscriptions ps WHERE ps.user_id = u.id ${appAndP} AND ps.state::text  = ANY(${$ppStatuses}::text[]))
      ${dw} ORDER BY u.id
    `;
  }

  const res = await src.query(sql, p);
  return res.rows.map((r) => r.id);
}

// ─── PERCENTAGE SAMPLING ─────────────────────────────────────────────────────
// Deterministic via MD5(userId) % 100 — same user always lands in same bucket.

function sampleByPercent(ids, percent) {
  if (percent >= 100) return ids;
  return ids.filter((id) => {
    const bucket = parseInt(crypto.createHash('md5').update(id).digest('hex').slice(0, 8), 16) % 100;
    return bucket < percent;
  });
}

// ─── COLUMN HELPERS ──────────────────────────────────────────────────────────

function col(name) { return { src: name, dest: name }; }
function colMap(s, d) { return { src: s, dest: d }; }

// ─── TABLE CONFIGS ───────────────────────────────────────────────────────────
// isRoot     — the WHERE clause uses `id` instead of a foreign-key column
// noPk       — serial PK; we don't include it; no ON CONFLICT possible
// conflictOn — column(s) to use in ON CONFLICT instead of columns[0]

const TABLE_CONFIGS = [
  {
    table: 'user', userColumn: 'id', isRoot: true,
    columns: [
      col('id'), col('name'), col('email'), col('emailVerified'),
      col('phoneNumber'), col('phoneNumberVerified'), col('image'),
      col('createdAt'), col('updatedAt'),
    ],
  },
  {
    table: 'account', userColumn: 'userId',
    columns: [
      col('id'), col('accountId'), col('providerId'), col('userId'),
      col('accessToken'), col('refreshToken'), col('idToken'),
      col('accessTokenExpiresAt'), col('refreshTokenExpiresAt'),
      col('scope'), col('password'), col('createdAt'), col('updatedAt'),
    ],
  },
  {
    table: 'user_metadata', userColumn: 'userId',
    conflictOn: ['userId', 'app_id'],
    columns: [
      col('userId'), col('app_id'), col('upi_vpa'),
      col('audio_language'), col('created_at'), col('updated_at'),
      // 'has_cancelled_subscription' exists in source but NOT in target → skipped
    ],
    noPk: false, skipPk: true, // no PK column included; conflict on unique(userId, app_id)
  },
  {
    table: 'subscriptions', userColumn: 'user_id',
    columns: [
      col('id'), col('razorpay_subscription_id'), col('razorpay_plan_id'),
      col('user_id'), col('app_id'), col('customer_id'), col('razorpay_customer_id'),
      col('status'), col('quantity'), col('total_count'), col('paid_count'),
      col('remaining_count'), col('start_at'), col('end_at'), col('charge_at'),
      col('current_start'), col('current_end'), col('notes'),
      col('razorpay_payment_id'), col('four_hour_event_sent'), col('metadata'),
      col('created_at'), col('updated_at'),
    ],
  },
  {
    // Source: serial PK, target: varchar(10) nanoid PK
    // Dedup via merchant_subscription_id (unique in both)
    table: 'phonepe_subscriptions', userColumn: 'user_id',
    conflictOn: ['merchant_subscription_id'],
    skipPk: true,
    columns: [
      col('merchant_subscription_id'), col('phonepe_subscription_id'),
      col('user_id'), col('app_id'), col('amount'), col('amount_type'), col('frequency'),
      colMap('state', 'state'),
      colMap('start_date', 'activated_at'),
      colMap('end_date', 'expire_at'),
      colMap('next_charge_date', 'next_billing_date'),
      col('metadata'), col('created_at'), col('updated_at'),
    ],
  },
  {
    table: 'orders', userColumn: 'user_id',
    columns: [
      col('id'), col('razorpay_order_id'), col('user_id'), col('app_id'),
      col('customer_id'), col('razorpay_customer_id'), col('amount'), col('currency'),
      col('max_amount'), col('frequency'), col('status'), col('razorpay_payment_id'),
      col('token_id'), col('payment_metadata'), col('notes'),
      col('expire_at'), col('created_at'), col('updated_at'),
    ],
  },
  {
    table: 'push_tokens', userColumn: 'user_id',
    conflictOn: ['token'],
    skipPk: true,
    columns: [
      col('user_id'), col('app_id'), col('token'), col('device_model'),
      col('os_version'), col('is_active'), col('created_at'), col('updated_at'),
    ],
  },
  {
    table: 'device_sessions', userColumn: 'user_id',
    noPk: true,
    columns: [
      col('user_id'), col('app_id'), col('device_model'), col('os_version'),
      col('app_version'), col('build_number'), col('platform'),
      col('manufacturer'), col('brand'), col('locale'), col('timezone'), col('created_at'),
    ],
  },
  {
    table: 'play_store_ratings', userColumn: 'user_id',
    noPk: true,
    columns: [
      col('user_id'), col('app_id'), col('rating'), col('review'), col('review_title'),
      col('package_name'), col('app_version'), col('device_model'), col('os_version'),
      col('language'), col('submitted_to_play_store_at'), col('created_at'), col('updated_at'),
    ],
  },
  {
    table: 'abandoned_checkouts', userColumn: 'user_id',
    noPk: true,
    columns: [
      col('user_id'), col('app_id'), col('checkout_started_at'), col('offer_expires_at'),
      col('discount_notification_sent'), col('discount_notification_sent_at'),
      col('notifications_sent'), col('last_notification_sent_at'),
      col('next_notification_scheduled_at'), col('created_at'),
    ],
  },
  {
    table: 'user_images', userColumn: 'user_id',
    noPk: true,
    columns: [
      col('user_id'), col('app_id'), col('image_url'), col('removed_bg_image_url'), col('created_at'),
    ],
  },
];

// ─── MIGRATE ONE TABLE  ───────────────────────────────────────────────────────

async function migrateTable(src, dest, cfg, userIds, opts) {
  const { table, userColumn, columns, noPk, skipPk, conflictOn, isRoot } = cfg;
  const whereCol = isRoot ? 'id' : userColumn;
  const srcCols = columns.map((c) => `"${c.src}"`).join(', ');

  // Scope to the specified app_id for tables that carry one (only if --app-id was provided)
  const hasAppId = TABLES_WITH_APP_ID.has(table) && !!opts.appId;
  const appFilter = hasAppId ? `AND "app_id" = $2` : '';
  const queryParams = hasAppId ? [userIds, opts.appId] : [userIds];

  const res = await src.query(
    `SELECT ${srcCols} FROM "${table}" WHERE "${whereCol}" = ANY($1) ${appFilter}`,
    queryParams,
  );
  if (res.rows.length === 0) return 0;
  if (opts.dryRun) {
    console.log(`    [DRY-RUN] "${table}": would write ${res.rows.length} rows`);
    return res.rows.length;
  }

  const destCols = columns.map((c) => `"${c.dest}"`).join(', ');
  const values = [];
  const placeholders = res.rows.map((row, ri) => {
    return '(' + columns.map((c, ci) => {
      values.push(row[c.src]);
      return `$${ri * columns.length + ci + 1}`;
    }).join(', ') + ')';
  }).join(', ');

  let conflictClause;

  if (noPk) {
    // Serial PK tables — just append, allow duplicates gracefully
    try {
      await dest.query(
        `INSERT INTO "${table}" (${destCols}) VALUES ${placeholders}`,
        values,
      );
    } catch (err) {
      console.warn(`    [WARN] "${table}": ${err.message}`);
    }
    return res.rows.length;
  }

  if (conflictOn) {
    const conflictCols = conflictOn.map((c) => `"${c}"`).join(', ');
    const updateSet = columns
      .filter((c) => !conflictOn.includes(c.dest))
      .map((c) => `"${c.dest}" = EXCLUDED."${c.dest}"`);
    conflictClause = `ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateSet.join(', ')}`;
  } else {
    // First column is PK
    const pk = `"${columns[0].dest}"`;
    const updateSet = columns.slice(1).map((c) => `"${c.dest}" = EXCLUDED."${c.dest}"`);
    conflictClause = `ON CONFLICT (${pk}) DO UPDATE SET ${updateSet.join(', ')}`;
  }

  try {
    await dest.query(
      `INSERT INTO "${table}" (${destCols}) VALUES ${placeholders} ${conflictClause}`,
      values,
    );
  } catch (err) {
    console.error(`    [ERROR] "${table}": ${err.message}`);
    return 0;
  }

  return res.rows.length;
}

// ─── MIGRATION LOGS ───────────────────────────────────────────────────────────

async function createMigrationLogEntry(dest, runId, opts, selectedCount) {
  await dest.query(
    `INSERT INTO migration_logs (
      id, user_id, phone_number, source_app_id, destination_app_id,
      started_at, status, current_state, tables_migrated, tables_failed, records_count,
      device_info
    ) VALUES (
      $1, 'system', 'bulk-migration', $2, $2,
      NOW(), 'in_progress', 'running', '[]'::jsonb, '[]'::jsonb, 0,
      $3::jsonb
    )`,
    [
      runId,
      opts.appId || 'all-apps',
      JSON.stringify({
        filter: opts.filter,
        percent: opts.percent,
        fromDate: opts.fromDate,
        toDate: opts.toDate,
        batchSize: opts.batchSize,
        dryRun: opts.dryRun,
        usersSelected: selectedCount,
      }),
    ],
  );
}

async function updateMigrationLog(dest, runId, { status, tablesMigrated, tablesFailed, recordsCount, errorMessage }) {
  await dest.query(
    `UPDATE migration_logs
     SET status           = $2,
         current_state    = $2,
         completed_at     = NOW(),
         duration         = EXTRACT(EPOCH FROM (NOW() - started_at))::int,
         tables_migrated  = $3::jsonb,
         tables_failed    = $4::jsonb,
         records_count    = $5,
         error_message    = $6,
         updated_at       = NOW()
     WHERE id = $1`,
    [
      runId,
      status,
      JSON.stringify(tablesMigrated),
      JSON.stringify(tablesFailed),
      recordsCount,
      errorMessage || null,
    ],
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const destUrl = process.env.DATABASE_URL;

  if (!sourceUrl) {
    console.error('❌  SOURCE_DATABASE_URL is required (kirana-fe Supabase connection string)');
    console.error('    Set it in .env.local as: SOURCE_DATABASE_URL=postgresql://...');
    process.exit(1);
  }
  if (!destUrl) {
    console.error('❌  DATABASE_URL is required (kwiktwik-kirana-be target DB connection string)');
    process.exit(1);
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('   kirana-fe  →  kwiktwik-kirana-be   USER MIGRATION');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Filter     : ${opts.filter}`);
  console.log(`  Percent    : ${opts.percent}%`);
  console.log(`  Date range : ${opts.fromDate || '*'} → ${opts.toDate || '*'}`);
  console.log(`  App ID     : ${opts.appId || '(none — all apps included)'}`);
  console.log(`  Batch size : ${opts.batchSize}`);
  console.log(`  Dry-run    : ${opts.dryRun}`);
  console.log('──────────────────────────────────────────────────────────\n');

  const sourcePool = new pg.Pool(buildPoolOpts(sourceUrl));
  const destPool = new pg.Pool(buildPoolOpts(destUrl));

  const src = await sourcePool.connect();
  const dest = await destPool.connect();

  // Unique run ID for migration_logs
  const runId = crypto.randomUUID();

  // Per-table stats
  const stats = {};  // table → row count
  const tablesFailed = [];

  try {
    // ── 1. Fetch candidate user IDs ──────────────────────────────────────────
    console.log('1/4  Fetching candidate users from source…');
    const allCandidates = await fetchCandidateUserIds(src, opts);
    console.log(`     → ${allCandidates.length} users match filter "${opts.filter}"${opts.fromDate || opts.toDate ? ` in range [${opts.fromDate || '*'} → ${opts.toDate || '*'}]` : ''}`);

    // ── 2. Percentage sampling ───────────────────────────────────────────────
    console.log(`2/4  Sampling ${opts.percent}% (deterministic by MD5 bucket)…`);
    const selectedIds = sampleByPercent(allCandidates, opts.percent);
    console.log(`     → ${selectedIds.length} users selected for migration`);

    if (selectedIds.length === 0) {
      console.log('\n✅  Nothing to migrate.');
      return;
    }

    // ── 3. Create migration_logs entry ───────────────────────────────────────
    if (!opts.dryRun) {
      await createMigrationLogEntry(dest, runId, opts, selectedIds.length);
      console.log(`\n     Migration log ID: ${runId}`);
    }

    // ── 4. Migrate in batches ────────────────────────────────────────────────
    console.log(`\n3/4  Migrating ${selectedIds.length} users (batch: ${opts.batchSize})…`);
    if (opts.dryRun) console.log('     [DRY-RUN — no writes]\n');

    let processed = 0;
    const batchSize = opts.batchSize;

    for (let i = 0; i < selectedIds.length; i += batchSize) {
      const batch = selectedIds.slice(i, i + batchSize);

      for (const cfg of TABLE_CONFIGS) {
        try {
          const n = await migrateTable(src, dest, cfg, batch, opts);
          stats[cfg.table] = (stats[cfg.table] || 0) + n;
        } catch (err) {
          console.error(`    [ERROR] "${cfg.table}" batch ${i}–${i + batch.length}: ${err.message}`);
          if (!tablesFailed.includes(cfg.table)) tablesFailed.push(cfg.table);
        }
      }

      processed += batch.length;
      process.stdout.write(`\r     Progress: ${processed}/${selectedIds.length} users processed`);
    }

    console.log('\n');

    // ── 5. Summary ───────────────────────────────────────────────────────────
    const tablesMigrated = Object.keys(stats).filter((t) => !tablesFailed.includes(t));
    const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);

    console.log('4/4  Summary');
    console.log('──────────────────────────────────────────────────────────');
    console.log(`  Run ID          : ${runId}`);
    console.log(`  Users selected  : ${selectedIds.length}`);
    console.log(`  Total rows      : ${totalRecords}`);
    console.log(`  Tables OK       : ${tablesMigrated.join(', ')}`);
    if (tablesFailed.length) {
      console.log(`  Tables FAILED   : ${tablesFailed.join(', ')}`);
    }
    console.log('\n  Per-table breakdown:');
    console.table(
      Object.entries(stats).map(([table, rows]) => ({
        table,
        rows,
        status: tablesFailed.includes(table) ? '❌ error' : '✅',
      })),
    );

    // ── 6. Update migration_logs ─────────────────────────────────────────────
    if (!opts.dryRun) {
      await updateMigrationLog(dest, runId, {
        status: tablesFailed.length === 0 ? 'completed' : 'partial',
        tablesMigrated,
        tablesFailed,
        recordsCount: totalRecords,
        errorMessage: tablesFailed.length
          ? `Failed tables: ${tablesFailed.join(', ')}`
          : null,
      });
      console.log(`\n✅  Migration complete. Log updated in migration_logs (id: ${runId})`);
    } else {
      console.log('\n⚠️   DRY-RUN complete — source was only read, target DB was not modified.');
    }

  } catch (err) {
    console.error('\n❌  Fatal error:', err.message);
    if (!opts.dryRun) {
      try {
        await updateMigrationLog(dest, runId, {
          status: 'failed',
          tablesMigrated: Object.keys(stats),
          tablesFailed,
          recordsCount: Object.values(stats).reduce((a, b) => a + b, 0),
          errorMessage: err.message,
        });
      } catch { /* best-effort */ }
    }
    throw err;
  } finally {
    src.release();
    dest.release();
    await sourcePool.end();
    await destPool.end();
  }
}

main().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
