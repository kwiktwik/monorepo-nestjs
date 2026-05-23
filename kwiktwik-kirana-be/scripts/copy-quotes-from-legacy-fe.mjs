/**
 * Copy quotes data from source DB (KWIKTWIK_DATABASE_URL) to kwiktwik-kirana-be (DATABASE_URL / quotes).
 *
 * Usage:
 *   npm run db:copy-quotes
 *   # Or with RDS/self-signed cert:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 DOTENV_CONFIG_PATH=.env.local node scripts/copy-quotes-from-kirana-fe.mjs
 *
 * Requires in .env.local (or env):
 *   - KWIKTWIK_DATABASE_URL: source DB connection string
 *   - SOURCE_QUOTES_TABLE: source table name (e.g. quotes table in kirana-fe)
 *   - DATABASE_URL: destination DB (kwiktwik-kirana-be quotes)
 *
 * Prerequisite: quotes table must exist in destination. Run: npm run db:push
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const envPath = process.env.DOTENV_CONFIG_PATH || '.env.local';

function loadEnv(path) {
  try {
    const content = readFileSync(resolve(process.cwd(), path), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch (e) {
    console.warn(`Could not load ${path}:`, e.message);
  }
}

loadEnv(envPath);

// If KWIKTWIK_DATABASE_URL not set, try kirana-fe .env
if (!process.env.KWIKTWIK_DATABASE_URL) {
  const fePath = resolve(process.cwd(), '../kirana-fe/.env');
  loadEnv(fePath);
}

const { Pool } = pg;

function getDestConnectionUrl() {
  let url = process.env.DATABASE_URL || '';
  if (
    url &&
    !url.startsWith('postgresql://') &&
    !url.startsWith('postgres://')
  ) {
    const host = url;
    const port = process.env.DB_PORT || '5432';
    const user = process.env.AWS_RDS_USER || 'postgres';
    const password = process.env.AWS_RDS_PASSWORD;
    const dbName = process.env.DB_NAME || 'kiranaapps';
    if (password) {
      url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}?sslmode=require`;
    }
  }
  if (url && !url.includes('sslmode=')) {
    url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return url;
}

const COLUMNS = [
  'id', 'text', 'content_type', 'category_type', 'slot', 'url', 'video_url',
  'preview_image_url', 'sticker_url', 'name_color', 'name_outline_color',
  'variant_type', 'frame', 'slot_raw', 'source_category', 'created_by',
  'quote_creator_id', 'quote_creator_type', 'raw_json', 'created_at', 'updated_at',
];

const BATCH_SIZE = 500;

async function main() {
  const sourceUrl = process.env.KWIKTWIK_DATABASE_URL;
  const destUrl = getDestConnectionUrl();

  const sourceTable = process.env.SOURCE_QUOTES_TABLE;
  if (!sourceUrl) {
    console.error('KWIKTWIK_DATABASE_URL is required (source DB connection string)');
    process.exit(1);
  }
  if (!sourceTable) {
    console.error('SOURCE_QUOTES_TABLE is required (source DB quotes table name)');
    process.exit(1);
  }
  if (!destUrl) {
    console.error('DATABASE_URL (or AWS_RDS_*) is required (destination: kwiktwik-kirana-be quotes)');
    process.exit(1);
  }

  const sourcePool = new Pool({ connectionString: sourceUrl });
  const destPool = new Pool({
    connectionString: destUrl,
    ...(destUrl.includes('sslmode=') && { ssl: { rejectUnauthorized: false } }),
  });

  try {
    const countRes = await sourcePool.query(
      `SELECT COUNT(*)::int AS n FROM ${sourceTable}`,
    );
    const total = countRes.rows[0]?.n ?? 0;
    console.log(`Source: ${total} rows in ${sourceTable}`);
    if (total === 0) {
      console.log('Nothing to copy.');
      return;
    }

    const destClient = await destPool.connect();
    let copied = 0;
    let offset = 0;

    try {
      while (true) {
        const rows = await sourcePool.query(
          `SELECT ${COLUMNS.join(', ')} FROM ${sourceTable} ORDER BY id LIMIT $1 OFFSET $2`,
          [BATCH_SIZE, offset],
        );
        if (rows.rows.length === 0) break;

        const setClause = COLUMNS.slice(1).map((c) => `${c} = EXCLUDED.${c}`).join(', ');
        const valueLists = rows.rows.map((row, i) => {
          const start = i * COLUMNS.length;
          return '(' + COLUMNS.map((_, j) => `$${start + j + 1}`).join(', ') + ')';
        }).join(', ');
        const values = rows.rows.flatMap((row) => COLUMNS.map((c) => row[c]));

        await destClient.query(
          `INSERT INTO quotes (${COLUMNS.join(', ')})
           VALUES ${valueLists}
           ON CONFLICT (id) DO UPDATE SET ${setClause}`,
          values,
        );

        copied += rows.rows.length;
        offset += rows.rows.length;
        console.log(`Copied ${copied}/${total} rows...`);
        if (rows.rows.length < BATCH_SIZE) break;
      }
    } finally {
      destClient.release();
    }

    console.log(`Done. Total copied: ${copied}`);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
