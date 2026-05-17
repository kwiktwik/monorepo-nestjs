/**
 * Upload companion profile images from data/companion_profile to Cloudflare R2.
 *
 * Usage:
 *   node scripts/upload-companion-images.mjs
 *   node scripts/upload-companion-images.mjs --from-json
 *   node scripts/upload-companion-images.mjs --from-json --update-json
 *   node scripts/upload-companion-images.mjs --migrate            # shortcut for --from-json --update-json
 *   node scripts/upload-companion-images.mjs --update-json --json-only
 *   node scripts/upload-companion-images.mjs --dry-run
 *   node scripts/upload-companion-images.mjs --concurrency 10
 *
 * Required env (in .env or .env.local):
 *   SLYDEE_S3_ENDPOINT
 *   SLYDEE_R2_ACCESS_KEY_ID
 *   SLYDEE_R2_ACCESS_KEY_SECRET
 *
 * Optional:
 *   SLYDEE_R2_BUCKET_NAME      (default: companions)
 *   SLYDEE_R2_KEY_PREFIX       (default: companion_profiles)
 *   SLYDEE_R2_PUBLIC_DOMAIN    (default: slydeecdn.kwiktwik.com)
 *   SLYDEE_R2_TOKEN            (loaded for reference; S3 API uses access key + secret)
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, relative, extname, join } from 'path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

/**
 * Run async tasks with a concurrency limit.
 * @param {Array} items
 * @param {number} limit
 * @param {(item: any, index: number) => Promise<any>} fn
 */
async function pMap(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Retry an async function with exponential backoff.
 */
async function withRetry(fn, { retries = DEFAULT_RETRIES, label = '' } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
        console.warn(`  retry ${attempt}/${retries} for ${label}: ${err.message} (waiting ${delay}ms)`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
]);

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const DEFAULT_SOURCE_DIR = 'data/companion_profile';
const DEFAULT_BUCKET = 'companions';
const DEFAULT_KEY_PREFIX = 'companion_profiles';
const DEFAULT_PUBLIC_DOMAIN = 'slydeecdn.kwiktwik.com';

const envPath = process.env.DOTENV_CONFIG_PATH || '.env';

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
  } catch {
    // .env.local fallback
    if (path === '.env') {
      try {
        loadEnv('.env.local');
      } catch {
        /* ignore */
      }
    }
  }
}

loadEnv(envPath);
if (!process.env.SLYDEE_S3_ENDPOINT) {
  loadEnv('.env.local');
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    skipExisting: true,
    updateJson: false,
    jsonOnly: false,
    fromJson: false,
    concurrency: DEFAULT_CONCURRENCY,
    sourceDir: DEFAULT_SOURCE_DIR,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--force') args.skipExisting = false;
    else if (arg === '--update-json') args.updateJson = true;
    else if (arg === '--json-only') {
      args.jsonOnly = true;
      args.updateJson = true;
    } else if (arg === '--from-json') args.fromJson = true;
    else if (arg === '--migrate') {
      args.fromJson = true;
      args.updateJson = true;
    } else if (arg === '--concurrency' && argv[i + 1]) {
      args.concurrency = Math.max(1, parseInt(argv[++i], 10) || DEFAULT_CONCURRENCY);
    } else if (arg === '--source' && argv[i + 1]) {
      args.sourceDir = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/upload-companion-images.mjs [options]

Options:
  --dry-run              List files/URLs and keys without uploading
  --force                Re-upload even if object already exists in bucket
  --from-json            Download imageUrls/gifUrls from JSON and upload to R2
  --update-json          Rewrite imageUrls/gifUrls in companion JSON to the CDN domain
  --migrate              Shortcut for --from-json --update-json
  --json-only            Only rewrite JSON URLs (no download/upload; needs no local files)
  --concurrency <n>      Max parallel uploads (default: ${DEFAULT_CONCURRENCY})
  --source <path>        Source directory (default: ${DEFAULT_SOURCE_DIR})
  --help                 Show this help

By default: uploads local images if present, otherwise uses URLs from JSON files.
`);
      process.exit(0);
    }
  }
  return args;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
}

function walkImages(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkImages(fullPath, files);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

function buildObjectKey(sourceRoot, filePath, keyPrefix) {
  const rel = relative(sourceRoot, filePath).replace(/\\/g, '/');
  if (!keyPrefix) return rel;
  if (rel === keyPrefix || rel.startsWith(`${keyPrefix}/`)) return rel;
  return `${keyPrefix.replace(/\/$/, '')}/${rel}`;
}

function normalizePublicDomain(domain) {
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function buildPublicUrl(publicDomain, objectKey) {
  const host = normalizePublicDomain(publicDomain);
  const key = objectKey.replace(/^\//, '');
  return `https://${host}/${key}`;
}

function walkJsonFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsonFiles(fullPath, files);
      continue;
    }
    if (entry.name.endsWith('.json')) files.push(fullPath);
  }
  return files;
}

function filenameFromUrl(url) {
  const match = url.match(/\/([^/?#]+\.(?:jpe?g|png|gif|webp|avif))(?:\?.*)?$/i);
  return match?.[1] ?? null;
}

function objectKeyFromFilename(filename, keyPrefix) {
  const prefix = keyPrefix.replace(/\/$/, '');
  return prefix ? `${prefix}/${filename}` : filename;
}

function objectKeyFromUrl(url, keyPrefix) {
  const filename = filenameFromUrl(url);
  if (!filename) return null;
  return objectKeyFromFilename(filename, keyPrefix);
}

function rewriteMediaUrl(url, publicDomain, keyPrefix) {
  if (typeof url !== 'string') return url;
  const key = objectKeyFromUrl(url, keyPrefix);
  if (!key) return url;
  return buildPublicUrl(publicDomain, key);
}

function collectMediaUrlsFromTree(value, urls = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectMediaUrlsFromTree(item, urls);
    return urls;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'imageUrls' || k === 'gifUrls') {
        if (Array.isArray(v)) {
          for (const url of v) {
            if (typeof url === 'string' && filenameFromUrl(url)) urls.add(url);
          }
        }
      } else {
        collectMediaUrlsFromTree(v, urls);
      }
    }
    return urls;
  }
  return urls;
}

function collectMediaUrlsFromJson(sourceRoot) {
  const urls = new Set();
  for (const filePath of walkJsonFiles(sourceRoot)) {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    collectMediaUrlsFromTree(data, urls);
  }
  return [...urls].sort();
}

async function downloadImage(url) {
  return withRetry(
    async () => {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      const contentType = res.headers.get('content-type') || '';
      const buffer = Buffer.from(await res.arrayBuffer());
      return { buffer, contentType };
    },
    { label: url },
  );
}

function contentTypeFromKey(key, fallback = 'application/octet-stream') {
  const ext = extname(key).toLowerCase();
  return MIME_BY_EXT[ext] || fallback;
}

function rewriteMediaUrlsInTree(value, publicDomain, keyPrefix) {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteMediaUrlsInTree(item, publicDomain, keyPrefix));
  }
  if (value && typeof value === 'object') {
    const next = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'imageUrls' || k === 'gifUrls') {
        next[k] = Array.isArray(v)
          ? v.map((url) => rewriteMediaUrl(url, publicDomain, keyPrefix))
          : v;
      } else {
        next[k] = rewriteMediaUrlsInTree(v, publicDomain, keyPrefix);
      }
    }
    return next;
  }
  return value;
}

function updateCompanionJsonFiles(sourceRoot, publicDomain, keyPrefix) {
  const jsonFiles = walkJsonFiles(sourceRoot);
  let updatedFiles = 0;

  for (const filePath of jsonFiles) {
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const rewritten = rewriteMediaUrlsInTree(data, publicDomain, keyPrefix);
    const next = `${JSON.stringify(rewritten, null, 2)}\n`;
    if (next !== raw) {
      writeFileSync(filePath, next);
      updatedFiles++;
      console.log(`updated json: ${relative(process.cwd(), filePath)}`);
    }
  }

  return updatedFiles;
}

function createS3Client() {
  const endpoint = requireEnv('SLYDEE_S3_ENDPOINT');
  const accessKeyId = requireEnv('SLYDEE_R2_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('SLYDEE_R2_ACCESS_KEY_SECRET');

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

async function objectExists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
}

async function uploadBuffer(client, bucket, key, body, contentType, dryRun) {
  if (dryRun) {
    return { key, contentType, size: body.length, skipped: false };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return { key, contentType, size: body.length, skipped: false };
}

async function uploadFile(client, bucket, key, filePath, dryRun) {
  const contentType = contentTypeFromKey(key);
  const body = readFileSync(filePath);
  return uploadBuffer(client, bucket, key, body, contentType, dryRun);
}

async function uploadFromUrl(client, bucket, key, sourceUrl, dryRun) {
  if (dryRun) {
    return { key, contentType: contentTypeFromKey(key), size: 0, skipped: false };
  }

  const { buffer, contentType } = await downloadImage(sourceUrl);
  const resolvedType =
    contentType.split(';')[0].trim() || contentTypeFromKey(key);
  return uploadBuffer(client, bucket, key, buffer, resolvedType, dryRun);
}

async function main() {
  const args = parseArgs(process.argv);
  const sourceRoot = resolve(process.cwd(), args.sourceDir);
  const bucket =
    process.env.SLYDEE_R2_BUCKET_NAME?.trim() || DEFAULT_BUCKET;
  const keyPrefix =
    process.env.SLYDEE_R2_KEY_PREFIX?.trim() ?? DEFAULT_KEY_PREFIX;
  const publicDomain =
    process.env.SLYDEE_R2_PUBLIC_DOMAIN?.trim() || DEFAULT_PUBLIC_DOMAIN;

  console.log(`Source: ${sourceRoot}`);
  console.log(`Bucket: ${bucket}`);
  console.log(`Key prefix: ${keyPrefix || '(none)'}`);
  console.log(`Public domain: https://${normalizePublicDomain(publicDomain)}`);

  if (args.jsonOnly) {
    const updated = updateCompanionJsonFiles(
      sourceRoot,
      publicDomain,
      keyPrefix,
    );
    console.log(`\nJSON files updated: ${updated}`);
    return;
  }

  const localImages = walkImages(sourceRoot);
  const jsonUrls = collectMediaUrlsFromJson(sourceRoot);
  const useJson =
    args.fromJson || (localImages.length === 0 && jsonUrls.length > 0);

  if (localImages.length === 0 && jsonUrls.length === 0) {
    console.error(`No local images and no imageUrls/gifUrls in JSON under ${sourceRoot}`);
    process.exit(1);
  }

  if (args.dryRun) console.log('Mode: dry-run (no uploads)\n');
  console.log(`Concurrency: ${args.concurrency}\n`);

  const client = args.dryRun ? null : createS3Client();
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  if (localImages.length > 0 && !args.fromJson) {
    const sorted = localImages.sort();
    const total = sorted.length;
    console.log(`Local images: ${total}\n`);

    await pMap(sorted, args.concurrency, async (filePath, idx) => {
      const key = buildObjectKey(sourceRoot, filePath, keyPrefix);
      const publicUrl = buildPublicUrl(publicDomain, key);
      const label = `${relative(sourceRoot, filePath)} -> s3://${bucket}/${key}`;
      const progress = `[${idx + 1}/${total}]`;

      try {
        if (!args.dryRun && args.skipExisting) {
          const exists = await objectExists(client, bucket, key);
          if (exists) {
            console.log(`${progress} skip (exists): ${label}`);
            console.log(`  ${publicUrl}`);
            skipped++;
            return;
          }
        }

        const result = await uploadFile(client, bucket, key, filePath, args.dryRun);
        const action = args.dryRun ? 'would upload' : 'uploaded';
        console.log(`${progress} ${action}: ${label} (${result.size} bytes)`);
        console.log(`  ${publicUrl}`);
        uploaded++;
      } catch (err) {
        console.error(`${progress} failed: ${label}`);
        console.error(`  ${err.message}`);
        failures.push({ label, error: err.message });
        failed++;
      }
    });
  }

  if (useJson) {
    const total = jsonUrls.length;
    console.log(`JSON image URLs: ${total}\n`);

    await pMap(jsonUrls, args.concurrency, async (sourceUrl, idx) => {
      const key = objectKeyFromUrl(sourceUrl, keyPrefix);
      const progress = `[${idx + 1}/${total}]`;

      if (!key) {
        console.error(`${progress} skip (bad url): ${sourceUrl}`);
        failures.push({ label: sourceUrl, error: 'Could not extract filename from URL' });
        failed++;
        return;
      }

      const publicUrl = buildPublicUrl(publicDomain, key);
      const label = `${sourceUrl} -> s3://${bucket}/${key}`;

      try {
        if (!args.dryRun && args.skipExisting) {
          const exists = await objectExists(client, bucket, key);
          if (exists) {
            console.log(`${progress} skip (exists): ${label}`);
            console.log(`  ${publicUrl}`);
            skipped++;
            return;
          }
        }

        const result = await uploadFromUrl(client, bucket, key, sourceUrl, args.dryRun);
        const action = args.dryRun ? 'would upload' : 'uploaded';
        const sizeNote = result.size > 0 ? ` (${result.size} bytes)` : '';
        console.log(`${progress} ${action}: ${label}${sizeNote}`);
        console.log(`  ${publicUrl}`);
        uploaded++;
      } catch (err) {
        console.error(`${progress} failed: ${label}`);
        console.error(`  ${err.message}`);
        failures.push({ label, error: err.message });
        failed++;
      }
    });
  }

  console.log('\n---');
  console.log(
    `Done. ${args.dryRun ? 'Would upload' : 'Uploaded'}: ${uploaded}, skipped: ${skipped}, failed: ${failed}`,
  );

  if (failures.length > 0) {
    console.error(`\nFailed items:`);
    for (const { label, error } of failures) {
      console.error(`  - ${label}`);
      console.error(`    ${error}`);
    }
  }

  if (args.updateJson) {
    if (args.dryRun) {
      console.log('\n--update-json ignored in dry-run mode');
    } else if (uploaded === 0 && failed > 0) {
      console.warn('\n--update-json skipped: no images were uploaded successfully');
    } else {
      const updated = updateCompanionJsonFiles(
        sourceRoot,
        publicDomain,
        keyPrefix,
      );
      console.log(`\nJSON files updated: ${updated}`);
    }
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
