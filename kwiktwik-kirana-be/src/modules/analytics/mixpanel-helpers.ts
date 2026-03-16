import { UAParser } from 'ua-parser-js';

export interface MixpanelEnrichmentProps {
  $browser?: string;
  $device?: string;
  $os?: string;
  $ip?: string;
  $referrer?: string;
  $referring_domain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/**
 * Parse User-Agent string to extract browser, device, and OS info
 */
export function parseUserAgent(
  userAgent: string | undefined,
): Pick<MixpanelEnrichmentProps, '$browser' | '$device' | '$os'> {
  if (!userAgent) {
    return {};
  }

  try {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const device = parser.getDevice();
    const os = parser.getOS();

    return {
      $browser: browser.name || undefined,
      $device: device.model || device.vendor || undefined,
      $os: os.name || undefined,
    };
  } catch (error) {
    console.warn('[Mixpanel] Failed to parse User-Agent:', error);
    return {};
  }
}

/**
 * Extract UTM parameters from query parameters
 */
export function extractUtmParams(
  query: Record<string, string | string[] | undefined> | URLSearchParams,
): Pick<
  MixpanelEnrichmentProps,
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term'
> {
  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ] as const;
  const result: Partial<
    Pick<
      MixpanelEnrichmentProps,
      'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term'
    >
  > = {};

  try {
    if (query instanceof URLSearchParams) {
      utmKeys.forEach((key) => {
        const value = query.get(key);
        if (value) {
          result[key] = value;
        }
      });
    } else {
      utmKeys.forEach((key) => {
        const value = query[key];
        if (value && typeof value === 'string') {
          result[key] = value;
        }
      });
    }
  } catch (error) {
    console.warn('[Mixpanel] Failed to extract UTM params:', error);
  }

  return result;
}

/**
 * Extract referrer information from headers
 */
export function extractReferrer(
  referrer: string | undefined,
): Pick<MixpanelEnrichmentProps, '$referrer' | '$referring_domain'> {
  if (!referrer) {
    return {};
  }

  try {
    const url = new URL(referrer);
    return {
      $referrer: referrer,
      $referring_domain: url.hostname,
    };
  } catch (error) {
    // Invalid URL, just return the referrer as-is
    return {
      $referrer: referrer,
    };
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(
  headers: Record<string, string | string[] | undefined> | Headers,
): string | undefined {
  try {
    let forwardedFor: string | null = null;
    let realIp: string | null = null;

    if (headers instanceof Headers) {
      forwardedFor = headers.get('x-forwarded-for') ?? null;
      realIp = headers.get('x-real-ip') ?? null;
    } else {
      const forwarded = headers['x-forwarded-for'];
      forwardedFor =
        (Array.isArray(forwarded) ? forwarded[0] : forwarded) ?? null;
      const real = headers['x-real-ip'];
      realIp = (Array.isArray(real) ? real[0] : real) ?? null;
    }

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return realIp || undefined;
  } catch (error) {
    console.warn('[Mixpanel] Failed to extract client IP:', error);
    return undefined;
  }
}

/**
 * Combine all enrichment properties
 */
export function enrichMixpanelProperties(options: {
  userAgent?: string;
  referrer?: string;
  ip?: string;
  query?: Record<string, string | string[] | undefined> | URLSearchParams;
  headers?: Record<string, string | string[] | undefined> | Headers;
}): MixpanelEnrichmentProps {
  const { userAgent, referrer, ip, query, headers } = options;

  const enrichment: MixpanelEnrichmentProps = {
    ...parseUserAgent(userAgent),
    ...extractReferrer(referrer),
  };

  if (ip) {
    enrichment.$ip = ip;
  } else if (headers) {
    const clientIp = getClientIp(headers);
    if (clientIp) {
      enrichment.$ip = clientIp;
    }
  }

  if (query) {
    Object.assign(enrichment, extractUtmParams(query));
  }

  return enrichment;
}
