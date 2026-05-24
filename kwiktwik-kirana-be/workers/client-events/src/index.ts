import type { Env } from './types';
import { validateClientKey, validateAdminKey, unauthorized } from './auth';
import { handleIngest } from './handlers/ingest';
import { handleQuery, handleStats } from './handlers/query';

export default {
  /**
   * HTTP request handler — routes to ingest or query handlers
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    let response: Response;

    // POST /events — ingest (client API key)
    if (method === 'POST' && pathname === '/events') {
      if (!validateClientKey(request, env)) {
        response = unauthorized();
      } else {
        response = await handleIngest(request, env);
      }
    }
    // GET /events/stats — aggregate stats (admin API key)
    else if (method === 'GET' && pathname === '/events/stats') {
      if (!validateAdminKey(request, env)) {
        response = unauthorized();
      } else {
        response = await handleStats(request, env);
      }
    }
    // GET /events — query events (admin API key)
    else if (method === 'GET' && pathname === '/events') {
      if (!validateAdminKey(request, env)) {
        response = unauthorized();
      } else {
        response = await handleQuery(request, env);
      }
    }
    // Health check
    else if (method === 'GET' && pathname === '/health') {
      response = Response.json({ status: 'ok', service: 'client-events-worker' });
    }
    // 404
    else {
      response = Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Attach CORS headers to every response
    for (const [key, value] of Object.entries(corsHeaders())) {
      response.headers.set(key, value);
    }
    return response;
  },

  /**
   * Cron trigger — daily cleanup of events older than RETENTION_DAYS
   */
  async scheduled(
    _controller: ScheduledController,
    env: Env,
  ): Promise<void> {
    const retentionDays = parseInt(env.RETENTION_DAYS || '30', 10);

    try {
      const result = await env.DB.prepare(
        `DELETE FROM client_events WHERE created_at < datetime('now', '-' || ? || ' days')`,
      )
        .bind(retentionDays)
        .run();

      console.log(
        `[CLEANUP] Deleted ${result.meta.changes} events older than ${retentionDays} days`,
      );
    } catch (err) {
      console.error('[CLEANUP] Failed to purge old events:', err);
    }
  },
} satisfies ExportedHandler<Env>;

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-Admin-Key',
  };
}