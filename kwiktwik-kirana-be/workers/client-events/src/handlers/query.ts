import type { Env } from '../types';

/**
 * GET /events — query events with filters
 *
 * Query params:
 *   eventType, userId, appId, from, to, limit (default 100), offset (default 0)
 */
export async function handleQuery(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const eventType = url.searchParams.get('eventType');
  const userId = url.searchParams.get('userId');
  const appId = url.searchParams.get('appId');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 1000);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (eventType) {
    conditions.push('event_type = ?');
    bindings.push(eventType);
  }
  if (userId) {
    conditions.push('user_id = ?');
    bindings.push(userId);
  }
  if (appId) {
    conditions.push('app_id = ?');
    bindings.push(appId);
  }
  if (from) {
    conditions.push('created_at >= ?');
    bindings.push(from);
  }
  if (to) {
    conditions.push('created_at <= ?');
    bindings.push(to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const query = `SELECT * FROM client_events ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...bindings).all();

    return Response.json({
      data: result.results,
      meta: { limit, offset, count: result.results.length },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown DB error';
    return Response.json(
      { error: 'Query failed', detail: message },
      { status: 500 },
    );
  }
}

/**
 * GET /events/stats — aggregate event counts
 *
 * Query params:
 *   groupBy (eventType | appId | userId), from, to
 */
export async function handleStats(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const groupBy = url.searchParams.get('groupBy') || 'eventType';
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const columnMap: Record<string, string> = {
    eventType: 'event_type',
    appId: 'app_id',
    userId: 'user_id',
  };

  const column = columnMap[groupBy];
  if (!column) {
    return Response.json(
      { error: 'groupBy must be one of: eventType, appId, userId' },
      { status: 400 },
    );
  }

  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (from) {
    conditions.push('created_at >= ?');
    bindings.push(from);
  }
  if (to) {
    conditions.push('created_at <= ?');
    bindings.push(to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const query = `SELECT ${column} as group_key, COUNT(*) as count FROM client_events ${where} GROUP BY ${column} ORDER BY count DESC LIMIT 100`;
    const stmt = env.DB.prepare(query);
    const result = bindings.length > 0
      ? await stmt.bind(...bindings).all()
      : await stmt.all();

    return Response.json({ groupBy, data: result.results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown DB error';
    return Response.json(
      { error: 'Stats query failed', detail: message },
      { status: 500 },
    );
  }
}