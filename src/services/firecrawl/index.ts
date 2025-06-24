/**
 * Firecrawl MCP Integration
 * 
 * This module provides a comprehensive integration with Firecrawl MCP
 * for deep web research capabilities, including:
 * 
 * - Deep research workflow
 * - Parallel execution (v1.12.0+)
 * - Rate limiting and error handling
 * - Advanced data extraction
 */

// Export types
export * from './types.js';

// Export client implementation
export { createFirecrawlClient } from './client.js';

// Export data extraction utilities
export { 
  extractResearchData,
  type ExtractedInsight,
  type ExtractedResearch
} from './extraction.js';

// Export utility functions
export { executeParallel, createRateLimitedRequester } from './utils.js';
