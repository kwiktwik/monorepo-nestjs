import type { Env } from './types';

/** Validate the client API key from the X-API-Key header */
export function validateClientKey(request: Request, env: Env): boolean {
  const key = request.headers.get('X-API-Key');
  return !!key && key === env.CLIENT_API_KEY;
}

/** Validate the admin API key from the X-Admin-Key header */
export function validateAdminKey(request: Request, env: Env): boolean {
  const key = request.headers.get('X-Admin-Key');
  return !!key && key === env.ADMIN_API_KEY;
}

/** Return a 401 JSON response */
export function unauthorized(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}