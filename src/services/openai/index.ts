/**
 * OpenAI API Integration
 * 
 * This module provides a comprehensive interface to the OpenAI API
 * for structured analysis of research data with features including:
 * 
 * - Streaming support for real-time responses
 * - Parallel execution for multiple requests
 * - Schema validation for structured data
 * - Specialized tools for research data extraction
 * - Support for multiple models including search capabilities
 */

// Export client creator
export { createOpenAIClient } from './client.js';

// Export types
export type {
  AnalysisOptions,
  AnalysisResult,
  OpenAIClient,
  ParallelAnalysisOptions,
  StreamChunk,
  StructuredAnalysisOptions,
  StructuredAnalysisResult,
  TokenUsage,
  ToolFunction
} from './types.js';

// Export enums and constants
export { OpenAIModel } from './types.js';

// Export research tools
export { researchTools, validationSchemas } from './tools.js';

// Export utility functions
export {
  combineStreamChunks,
  executeParallelTasks,
  extractTokenUsage,
  formatStructuredResult,
  safeJsonParse,
  validateWithSchema
} from './utils.js';
