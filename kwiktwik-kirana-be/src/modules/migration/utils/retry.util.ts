import { Logger } from '@nestjs/common';

/**
 * Retry utility with exponential backoff
 */
export class RetryUtil {
  private static readonly logger = new Logger(RetryUtil.name);

  /**
   * Default retry configuration
   */
  static readonly DEFAULT_CONFIG = {
    maxRetries: 3,
    delays: [2000, 4000, 8000], // 2s, 4s, 8s
  };

  /**
   * Execute function with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    attempt: number,
    maxRetries: number = this.DEFAULT_CONFIG.maxRetries,
    delays: number[] = this.DEFAULT_CONFIG.delays,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxRetries) {
        this.logger.error(
          `Operation failed after ${maxRetries} attempts`,
          error instanceof Error ? error.message : 'Unknown error',
        );
        throw error;
      }

      const delay = delays[attempt - 1] || delays[delays.length - 1] || 10000;
      
      this.logger.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms...`,
        error instanceof Error ? error.message : 'Unknown error',
      );

      await this.sleep(delay);

      return this.withRetry(operation, attempt + 1, maxRetries, delays);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  static calculateBackoff(
    attempt: number,
    baseDelay: number = 2000,
    maxDelay: number = 30000,
  ): number {
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }
}
