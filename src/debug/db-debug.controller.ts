import {
  Controller,
  Get,
  Header,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_TOKEN } from '../database/drizzle.module';
import * as schema from '../database/schema';

@ApiExcludeController()
@Controller('debug/db')
export class DbDebugController {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private isEnabled() {
    return (
      process.env.ENABLE_DB_DEBUG === 'true' ||
      process.env.USE_MOCK_DB === 'true' ||
      process.env.NODE_ENV === 'test'
    );
  }

  private ensureEnabled() {
    // Hide this endpoint entirely unless explicitly enabled.
    if (!this.isEnabled()) throw new NotFoundException();
  }

  private rowsFrom<T extends Record<string, unknown>>(result: unknown): T[] {
    if (!result || typeof result !== 'object') return [];
    const rows = (result as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as T[]) : [];
  }

  @Get()
  @Header('content-type', 'text/html; charset=utf-8')
  ui() {
    this.ensureEnabled();
    // Minimal UI: lists tables and lets you click to preview rows.
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>pg-mem debug</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 24px; }
      .row { display: flex; gap: 24px; align-items: flex-start; }
      .col { flex: 1; min-width: 280px; }
      code { background: #f4f4f5; padding: 2px 6px; border-radius: 6px; }
      pre { background: #0b1020; color: #e5e7eb; padding: 12px; border-radius: 10px; overflow: auto; }
      a { text-decoration: none; }
      a:hover { text-decoration: underline; }
      .muted { color: #6b7280; }
      input { padding: 8px 10px; border-radius: 8px; border: 1px solid #e5e7eb; width: 120px; }
      button { padding: 8px 10px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; }
    </style>
  </head>
  <body>
    <h2>pg-mem debug</h2>
    <p class="muted">
      Tables are read from <code>information_schema.tables</code>.
    </p>
    <div class="row">
      <div class="col">
        <h3>Tables</h3>
        <div>
          <label>Limit: <input id="limit" type="number" min="1" max="200" value="50" /></label>
          <button id="refresh">Refresh</button>
        </div>
        <ul id="tables"></ul>
      </div>
      <div class="col">
        <h3>Preview</h3>
        <div id="previewMeta" class="muted"></div>
        <pre id="preview">(click a table)</pre>
      </div>
    </div>
    <script>
      const tablesEl = document.getElementById('tables');
      const previewEl = document.getElementById('preview');
      const metaEl = document.getElementById('previewMeta');
      const limitEl = document.getElementById('limit');
      const refreshBtn = document.getElementById('refresh');

      const base = location.pathname.replace(/\\/+$/, '');

      async function loadTables() {
        tablesEl.innerHTML = '<li class="muted">Loading…</li>';
        const res = await fetch(base + '/tables');
        const data = await res.json();
        tablesEl.innerHTML = '';
        for (const t of data.tables || []) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#';
          a.textContent = t;
          a.onclick = async (e) => {
            e.preventDefault();
            await loadPreview(t);
          };
          li.appendChild(a);
          tablesEl.appendChild(li);
        }
        if (!data.tables || data.tables.length === 0) {
          tablesEl.innerHTML = '<li class="muted">(no tables)</li>';
        }
      }

      async function loadPreview(table) {
        const limit = Number(limitEl.value || 50);
        metaEl.textContent = 'Loading ' + table + '…';
        previewEl.textContent = '';
        const res = await fetch(base + '/table/' + encodeURIComponent(table) + '?limit=' + encodeURIComponent(String(limit)));
        const data = await res.json();
        metaEl.textContent = table + ' (' + (data.rows ? data.rows.length : 0) + ' rows)';
        previewEl.textContent = JSON.stringify(data.rows || [], null, 2);
      }

      refreshBtn.onclick = () => loadTables().catch(err => {
        tablesEl.innerHTML = '<li class="muted">Failed: ' + (err && err.message ? err.message : String(err)) + '</li>';
      });

      loadTables();
    </script>
  </body>
</html>`;
  }

  @Get('tables')
  async tables() {
    this.ensureEnabled();

    const result = await this.db.execute(sql`
      select table_name as name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `);

    const rows = this.rowsFrom<{ name?: unknown }>(result);
    const tables = rows
      .map((r) => (typeof r.name === 'string' ? r.name : null))
      .filter((n): n is string => Boolean(n));
    return { tables };
  }

  @Get('table/:name')
  async tablePreview(
    @Param('name') name: string,
    @Query('limit') limit?: string,
  ) {
    this.ensureEnabled();

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new NotFoundException();
    }

    const parsedLimit = limit ? Number.parseInt(limit, 10) : NaN;
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 200)
      : 50;

    const result = await this.db.execute(
      sql.raw(`select * from "${name}" limit ${safeLimit}`),
    );

    return { rows: this.rowsFrom<Record<string, unknown>>(result) };
  }
}
