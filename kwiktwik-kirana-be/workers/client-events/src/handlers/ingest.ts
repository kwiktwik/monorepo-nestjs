import type { Env, IngestRequest, ClientEvent } from '../types';

/**
 * POST /events — batch-insert client diagnostic events into D1
 *
 * Accepts up to MAX_BATCH_SIZE events per request.
 * Returns 202 Accepted on success.
 */
export async function handleIngest(
  request: Request,
  env: Env,
): Promise<Response> {
  let body: IngestRequest;
  try {
    body = await request.json<IngestRequest>();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.appId || typeof body.appId !== 'string') {
    return Response.json({ error: 'appId is required' }, { status: 400 });
  }

  if (!Array.isArray(body.events) || body.events.length === 0) {
    return Response.json(
      { error: 'events array is required and must not be empty' },
      { status: 400 },
    );
  }

  const maxBatch = parseInt(env.MAX_BATCH_SIZE || '100', 10);
  if (body.events.length > maxBatch) {
    return Response.json(
      { error: `Batch size exceeds maximum of ${maxBatch}` },
      { status: 400 },
    );
  }

  const statements = body.events
    .filter((e) => e.eventType && typeof e.eventType === 'string')
    .map((event: ClientEvent) =>
      env.DB.prepare(
        `INSERT INTO client_events (event_type, app_id, user_id, device_model, os_version, app_version, payload, client_timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        event.eventType,
        body.appId,
        event.userId ?? null,
        event.deviceModel ?? null,
        event.osVersion ?? null,
        event.appVersion ?? null,
        event.payload ? JSON.stringify(event.payload) : null,
        event.timestamp ?? null,
      ),
    );

  if (statements.length === 0) {
    return Response.json(
      { error: 'No valid events in batch' },
      { status: 400 },
    );
  }

  try {
    await env.DB.batch(statements);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown DB error';
    return Response.json(
      { error: 'Failed to store events', detail: message },
      { status: 500 },
    );
  }

  return Response.json(
    { accepted: true, count: statements.length },
    { status: 202 },
  );
}