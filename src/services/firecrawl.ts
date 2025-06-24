import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { FirecrawlError, handleApiError } from '../utils/errors.js';

/**
 * Firecrawl API client
 * 
 * This module provides a type-safe interface to the Firecrawl MCP API
 * for web scraping and deep research capabilities.
 */

// Types for Firecrawl API responses
export interface DeepResearchResponse {
  id: string;
  status: string;
  data: {
    finalAnalysis: string;
    activities?: Array<{
      type: string;
      url?: string;
      query?: string;
      result?: string;
    }>;
    sources?: Array<{
      url: string;
      title?: string;
    }>;
  };
}

export interface DeepResearchOptions {
  query: string;
  maxDepth?: number;
  timeLimit?: number;
  maxUrls?: number;
}

export interface FirecrawlClient {
  deepResearch: (options: DeepResearchOptions) => Promise<DeepResearchResponse>;
  checkResearchStatus: (id: string) => Promise<DeepResearchResponse>;
}

/**
 * Creates a Firecrawl client with the configured API key
 */
export function createFirecrawlClient(): FirecrawlClient {
  const apiKey = env.FIRECRAWL_API_KEY;
  const baseUrl = 'https://api.firecrawl.dev';
  
  // Validate API key
  if (!apiKey) {
    throw new FirecrawlError('API key is required');
  }
  
  /**
   * Helper function to make authenticated requests to Firecrawl API
   */
  async function makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    body?: Record<string, unknown>
  ): Promise<T> {
    try {
      const url = `${baseUrl}${endpoint}`;
      
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
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
        throw new FirecrawlError(
          `Request failed with status ${response.status}: ${errorText}`,
          response.status
        );
      }
      
      return await response.json() as T;
    } catch (error) {
      if (error instanceof FirecrawlError) {
        throw error;
      }
      return handleApiError(error, 'Firecrawl');
    }
  }
  
  return {
    /**
     * Initiates a deep research operation using Firecrawl
     */
    async deepResearch(options: DeepResearchOptions): Promise<DeepResearchResponse> {
      const { query, maxDepth = env.MAX_DEPTH, timeLimit = env.TIME_LIMIT, maxUrls = env.MAX_URLS } = options;
      
      logger.info(`Starting deep research for query: ${query}`);
      
      return makeRequest<DeepResearchResponse>('/deep-research', 'POST', {
        query,
        maxDepth,
        timeLimit,
        maxUrls,
      });
    },
    
    /**
     * Checks the status of an ongoing research operation
     */
    async checkResearchStatus(id: string): Promise<DeepResearchResponse> {
      logger.debug(`Checking status of research: ${id}`);
      
      return makeRequest<DeepResearchResponse>(`/deep-research/${id}`);
    }
  };
}
