/**
 * Custom error types for PhonePe integration
 */

export class PhonePeError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message);
        this.name = 'PhonePeError';
    }
}

/**
 * Error codes for PhonePe operations
 */
export const PHONEPE_ERROR_CODES = {
    // Validation errors (400)
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    INVALID_REQUEST: 'INVALID_REQUEST',
    MISSING_PARAMETER: 'MISSING_PARAMETER',

    // Authentication errors (401)
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_SESSION: 'INVALID_SESSION',

    // Authorization errors (403)
    FORBIDDEN: 'FORBIDDEN',
    UNAUTHORIZED_ENV: 'UNAUTHORIZED_ENV',

    // Not found errors (404)
    ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',

    // API errors (500+)
    API_ERROR: 'API_ERROR',
    TIMEOUT: 'TIMEOUT',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_FAILED: 'AUTH_FAILED',

    // Unknown
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type PhonePeErrorCode = typeof PHONEPE_ERROR_CODES[keyof typeof PHONEPE_ERROR_CODES];

/**
 * Helper to create validation errors
 */
export function createValidationError(message: string, details?: any): PhonePeError {
    return new PhonePeError(message, PHONEPE_ERROR_CODES.INVALID_REQUEST, 400, details);
}

/**
 * Helper to create authorization errors
 */
export function createAuthError(message: string, details?: any): PhonePeError {
    return new PhonePeError(message, PHONEPE_ERROR_CODES.UNAUTHORIZED, 401, details);
}

/**
 * Helper to create forbidden errors
 */
export function createForbiddenError(message: string, details?: any): PhonePeError {
    return new PhonePeError(message, PHONEPE_ERROR_CODES.FORBIDDEN, 403, details);
}

/**
 * Helper to create not found errors
 */
export function createNotFoundError(message: string, details?: any): PhonePeError {
    return new PhonePeError(message, PHONEPE_ERROR_CODES.ORDER_NOT_FOUND, 404, details);
}
