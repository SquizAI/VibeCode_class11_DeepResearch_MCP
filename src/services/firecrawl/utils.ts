import { FirecrawlError, handleApiError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';
import { RateLimitOptions } from './types.js';

/**
 * Utility functions for Firecrawl MCP integration
 */

// Request queue for rate limiting
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private requestTimestamps: number[] = [];
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions = {}) {
    this.options = {
      maxRequestsPerMinute: options.maxRequestsPerMinute || 60,
      retryCount: options.retryCount || 3,
      retryDelayMs: options.retryDelayMs || 1000,
    };
  }

  /**
   * Add a request to the queue
   */
  async enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.executeWithRetry(requestFn);
          resolve(result as T);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    
    // Check if we need to wait due to rate limiting
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    // If we've hit the rate limit, wait before processing more
    if (this.requestTimestamps.length >= this.options.maxRequestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      
      logger.debug(`Rate limit reached, waiting ${waitTime}ms before next request`);
      
      setTimeout(() => {
        this.processQueue();
      }, waitTime + 100); // Add a small buffer
      
      return;
    }
    
    // Process the next request
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      this.requestTimestamps.push(now);
      
      try {
        await nextRequest();
      } catch (error) {
        logger.error('Error processing queued request', error);
      }
      
      // Continue processing the queue
      setImmediate(() => this.processQueue());
    } else {
      this.processing = false;
    }
  }

  /**
   * Execute a request with automatic retry on failure
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>, 
    attempt = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      // Don't retry if it's not a rate limit error or we've exceeded retry count
      if (
        !(error instanceof FirecrawlError && error.statusCode === 429) || 
        attempt > this.options.retryCount
      ) {
        throw error;
      }
      
      const delay = this.options.retryDelayMs * attempt;
      logger.debug(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${this.options.retryCount})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(requestFn, attempt + 1);
    }
  }
}

/**
 * Create a rate-limited request handler
 */
export function createRateLimitedRequester(options?: RateLimitOptions) {
  const queue = new RequestQueue(options);
  
  return {
    /**
     * Make a rate-limited request
     */
    async request<T>(requestFn: () => Promise<T>): Promise<T> {
      return queue.enqueue(requestFn);
    }
  };
}

/**
 * Parse and validate Firecrawl API response
 */
export function parseResponse<T>(response: unknown): T {
  if (!response || typeof response !== 'object') {
    throw new FirecrawlError('Invalid API response format');
  }
  
  return response as T;
}

/**
 * Execute tasks in parallel with concurrency control
 */
export async function executeParallel<T>(
  tasks: Array<() => Promise<T>>,
  maxConcurrent = 5,
  abortOnError = false
): Promise<T[]> {
  const results: T[] = [];
  const errors: Error[] = [];
  
  // Execute tasks in batches to control concurrency
  for (let i = 0; i < tasks.length; i += maxConcurrent) {
    const batch = tasks.slice(i, i + maxConcurrent);
    
    try {
      const batchResults = await Promise.all(
        batch.map(async (task) => {
          try {
            return await task();
          } catch (error) {
            if (abortOnError) {
              throw error;
            }
            
            errors.push(error instanceof Error ? error : new Error(String(error)));
            return null;
          }
        })
      );
      
      results.push(...batchResults.filter((result) => result !== null) as T[]);
    } catch (error) {
      if (abortOnError) {
        throw error;
      }
    }
  }
  
  // If there were errors and we didn't abort, log them
  if (errors.length > 0 && !abortOnError) {
    logger.warn(`${errors.length} errors occurred during parallel execution`, {
      errorCount: errors.length,
      firstError: errors[0]?.message
    });
  }
  
  return results;
}
