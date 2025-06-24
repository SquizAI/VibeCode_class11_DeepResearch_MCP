import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';
import { FirecrawlError, handleApiError } from '../../utils/errors.js';
import { 
  FirecrawlClient, 
  FirecrawlClientConfig,
  DeepResearchOptions,
  DeepResearchResponse,
  ParallelExecutionOptions
} from './types.js';
import { createRateLimitedRequester, executeParallel } from './utils.js';

/**
 * Firecrawl MCP client implementation
 * 
 * This module provides a type-safe interface to the Firecrawl MCP API
 * for web scraping and deep research capabilities.
 * 
 * Features:
 * - Deep research workflow
 * - Rate limiting
 * - Parallel execution (v1.12.0+)
 * - Comprehensive error handling
 */

/**
 * Creates a Firecrawl client with the configured API key
 */
export function createFirecrawlClient(config: FirecrawlClientConfig = {}): FirecrawlClient {
  const apiKey = config.apiKey || env.FIRECRAWL_API_KEY;
  const baseUrl = config.baseUrl || 'https://api.firecrawl.dev';
  
  // Validate API key
  if (!apiKey) {
    throw new FirecrawlError('API key is required');
  }
  
  // Initialize rate limiter
  const rateLimiter = createRateLimitedRequester(config.rateLimiting);
  
  // Default parallel execution options
  const defaultParallelOptions: Required<ParallelExecutionOptions> = {
    maxConcurrent: config.defaultParallelOptions?.maxConcurrent || 5,
    abortOnError: config.defaultParallelOptions?.abortOnError || false,
    timeoutMs: config.defaultParallelOptions?.timeoutMs || 30000
  };
  
  /**
   * Helper function to make authenticated requests to Firecrawl API
   */
  async function makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    body?: Record<string, unknown>
  ): Promise<T> {
    return rateLimiter.request(async () => {
      try {
        const url = `${baseUrl}${endpoint}`;
        
        const headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'FirecrawlNodeClient/1.12.0'
        };
        
        const options: RequestInit = {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        };
        
        logger.debug(`Making ${method} request to ${endpoint}`);
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorText = await response.text();
          const statusCode = response.status;
          
          // Handle specific error cases
          if (statusCode === 429) {
            throw new FirecrawlError('Rate limit exceeded', statusCode);
          } else if (statusCode === 401) {
            throw new FirecrawlError('Invalid API key', statusCode);
          } else if (statusCode >= 500) {
            throw new FirecrawlError('Firecrawl server error', statusCode);
          }
          
          throw new FirecrawlError(
            `Request failed with status ${statusCode}: ${errorText}`,
            statusCode
          );
        }
        
        return await response.json() as T;
      } catch (error) {
        if (error instanceof FirecrawlError) {
          throw error;
        }
        return handleApiError(error, 'Firecrawl');
      }
    });
  }
  
  /**
   * Implementation of the FirecrawlClient interface
   */
  return {
    /**
     * Initiates a deep research operation using Firecrawl
     */
    async deepResearch(options: DeepResearchOptions): Promise<DeepResearchResponse> {
      const { 
        query, 
        maxDepth = env.MAX_DEPTH, 
        timeLimit = env.TIME_LIMIT, 
        maxUrls = env.MAX_URLS,
        customInstructions,
        focusTopics
      } = options;
      
      logger.info(`Starting deep research for query: ${query}`);
      
      const requestBody: Record<string, unknown> = {
        query,
        maxDepth,
        timeLimit,
        maxUrls,
      };
      
      // Add optional parameters if provided
      if (customInstructions) {
        requestBody.customInstructions = customInstructions;
      }
      
      if (focusTopics && focusTopics.length > 0) {
        requestBody.focusTopics = focusTopics;
      }
      
      return makeRequest<DeepResearchResponse>('/v1.12.0/deep-research', 'POST', requestBody);
    },
    
    /**
     * Checks the status of an ongoing research operation
     */
    async checkResearchStatus(id: string): Promise<DeepResearchResponse> {
      logger.debug(`Checking status of research: ${id}`);
      
      return makeRequest<DeepResearchResponse>(`/v1.12.0/deep-research/${id}`);
    },
    
    /**
     * Executes multiple tasks in parallel with concurrency control
     * Supports the new v1.12.0 parallel execution feature
     */
    async executeParallel<T>(
      tasks: Array<() => Promise<T>>,
      options?: ParallelExecutionOptions
    ): Promise<T[]> {
      const {
        maxConcurrent = defaultParallelOptions.maxConcurrent,
        abortOnError = defaultParallelOptions.abortOnError,
        timeoutMs = defaultParallelOptions.timeoutMs
      } = options || {};
      
      logger.debug(`Executing ${tasks.length} tasks in parallel (max concurrency: ${maxConcurrent})`);
      
      // Add timeout to each task
      const tasksWithTimeout = tasks.map(task => {
        return async () => {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Task execution timed out')), timeoutMs);
          });
          
          return Promise.race([task(), timeoutPromise]) as Promise<T>;
        };
      });
      
      return executeParallel(tasksWithTimeout, maxConcurrent, abortOnError);
    },
    
    /**
     * Performs batch research on multiple queries in parallel
     */
    async batchResearch(
      queries: string[],
      options?: DeepResearchOptions & ParallelExecutionOptions
    ): Promise<DeepResearchResponse[]> {
      const {
        maxConcurrent = defaultParallelOptions.maxConcurrent,
        abortOnError = defaultParallelOptions.abortOnError,
        timeoutMs = defaultParallelOptions.timeoutMs,
        ...researchOptions
      } = options || {};
      
      logger.info(`Starting batch research for ${queries.length} queries`);
      
      // Create tasks for each query
      const tasks = queries.map(query => {
        return async () => {
          return this.deepResearch({
            ...researchOptions,
            query
          });
        };
      });
      
      return this.executeParallel(tasks, { maxConcurrent, abortOnError, timeoutMs });
    }
  };
}
