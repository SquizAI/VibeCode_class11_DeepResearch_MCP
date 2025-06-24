/**
 * Type definitions for Firecrawl MCP integration
 */

// Base research options
export interface DeepResearchOptions {
  query: string;
  maxDepth?: number;
  timeLimit?: number;
  maxUrls?: number;
  customInstructions?: string;
  focusTopics?: string[];
}

// Research activity types
export type ActivityType = 
  | 'search'
  | 'crawl'
  | 'extract'
  | 'analyze'
  | 'summarize';

// Research activity
export interface ResearchActivity {
  type: ActivityType;
  url?: string;
  query?: string;
  result?: string;
  timestamp?: string;
}

// Research source
export interface ResearchSource {
  url: string;
  title?: string;
  relevance?: 'high' | 'medium' | 'low';
  snippet?: string;
}

// Deep research response
export interface DeepResearchResponse {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  data: {
    finalAnalysis: string;
    activities?: ResearchActivity[];
    sources?: ResearchSource[];
    metadata?: Record<string, unknown>;
  };
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

// Parallel execution options
export interface ParallelExecutionOptions {
  maxConcurrent?: number;
  abortOnError?: boolean;
  timeoutMs?: number;
}

// Rate limiting options
export interface RateLimitOptions {
  maxRequestsPerMinute?: number;
  retryCount?: number;
  retryDelayMs?: number;
}

// Firecrawl client configuration
export interface FirecrawlClientConfig {
  apiKey?: string;
  baseUrl?: string;
  rateLimiting?: RateLimitOptions;
  defaultParallelOptions?: ParallelExecutionOptions;
}

// Firecrawl client interface
export interface FirecrawlClient {
  // Deep research methods
  deepResearch: (options: DeepResearchOptions) => Promise<DeepResearchResponse>;
  checkResearchStatus: (id: string) => Promise<DeepResearchResponse>;
  
  // Parallel execution methods
  executeParallel: <T>(
    tasks: Array<() => Promise<T>>, 
    options?: ParallelExecutionOptions
  ) => Promise<T[]>;
  
  // Batch processing methods
  batchResearch: (
    queries: string[], 
    options?: DeepResearchOptions & ParallelExecutionOptions
  ) => Promise<DeepResearchResponse[]>;
}
