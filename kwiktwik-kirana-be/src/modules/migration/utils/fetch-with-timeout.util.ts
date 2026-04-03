/**
 * Fetch with timeout utility
 * Prevents indefinite hanging of HTTP requests
 */

export interface FetchTiming {
  operation: string;
  url: string;
  durationMs: number;
  success: boolean;
  statusCode?: number;
  error?: string;
}

export class FetchTimeoutError extends Error {
  constructor(
    public readonly operation: string,
    public readonly url: string,
    public readonly timeoutMs: number,
  ) {
    super(`Request timeout: ${operation} to ${url} exceeded ${timeoutMs}ms`);
    this.name = 'FetchTimeoutError';
  }
}

/**
 * Execute fetch with timeout and detailed timing logging
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  operationName: string,
): Promise<{ response: Response; timing: FetchTiming }> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    const timing: FetchTiming = {
      operation: operationName,
      url: url.split('?')[0], // Remove query params for cleaner logs
      durationMs: duration,
      success: response.ok,
      statusCode: response.status,
    };

    return { response, timing };
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchTimeoutError(operationName, url, timeoutMs);
    }

    const timing: FetchTiming = {
      operation: operationName,
      url: url.split('?')[0],
      durationMs: duration,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    throw { error, timing };
  }
}

/**
 * Format timing information for logging
 */
export function formatTimingLog(timing: FetchTiming): string {
  const parts = [
    `Operation: ${timing.operation}`,
    `Duration: ${timing.durationMs}ms`,
    `Success: ${timing.success}`,
  ];

  if (timing.statusCode) {
    parts.push(`Status: ${timing.statusCode}`);
  }

  if (timing.error) {
    parts.push(`Error: ${timing.error}`);
  }

  return parts.join(' | ');
}

/**
 * Format multiple timing logs for database storage
 */
export function formatTimingLogs(timings: FetchTiming[]): string {
  if (timings.length === 0) return '';

  const totalDuration = timings.reduce((sum, t) => sum + t.durationMs, 0);
  const failedOps = timings.filter((t) => !t.success);

  const parts = [
    `Total HTTP Time: ${totalDuration}ms`,
    `Operations: ${timings.length}`,
    `Failed: ${failedOps.length}`,
  ];

  timings.forEach((t) => {
    parts.push(
      `  - ${t.operation}: ${t.durationMs}ms (Status: ${t.statusCode || 'N/A'}, Success: ${t.success})`,
    );
  });

  return parts.join('\n');
}
