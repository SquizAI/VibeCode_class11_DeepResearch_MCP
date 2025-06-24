import { z } from 'zod';
import logger from '../../utils/logger.js';
import { OpenAIError } from '../../utils/errors.js';
import { StreamChunk, StructuredAnalysisResult, TokenUsage } from './types.js';

/**
 * Utility functions for the OpenAI service
 */

/**
 * Parses a JSON string safely with error handling
 */
export function safeJsonParse<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    throw new OpenAIError(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validates data against a Zod schema
 */
export function validateWithSchema<T>(data: unknown, schema: z.ZodType<T>): { data: T; errors?: z.ZodError } {
  try {
    const result = schema.parse(data);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Schema validation failed', { errors: error.format() });
      return { data: data as T, errors: error };
    }
    throw error;
  }
}

/**
 * Extracts token usage from OpenAI response
 */
export function extractTokenUsage(usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }): TokenUsage {
  return {
    promptTokens: usage?.prompt_tokens || 0,
    completionTokens: usage?.completion_tokens || 0,
    totalTokens: usage?.total_tokens || 0,
  };
}

/**
 * Combines stream chunks into a complete function call result
 */
export function combineStreamChunks(chunks: StreamChunk[]): { content: string; functionName?: string; functionArguments?: string } {
  let content = '';
  let functionName: string | undefined;
  let functionArguments = '';
  
  for (const chunk of chunks) {
    if (chunk.content) {
      content += chunk.content;
    }
    
    if (chunk.functionName && !functionName) {
      functionName = chunk.functionName;
    }
    
    if (chunk.functionArguments) {
      functionArguments += chunk.functionArguments;
    }
  }
  
  return { content, functionName, functionArguments };
}

/**
 * Formats a structured analysis result
 */
export function formatStructuredResult<T>(
  functionName: string,
  result: T,
  usage: TokenUsage,
  validationErrors?: z.ZodError
): StructuredAnalysisResult<T> {
  return {
    functionName,
    result,
    usage,
    validationErrors,
  };
}

/**
 * Executes tasks in parallel with concurrency control
 */
export async function executeParallelTasks<T>(
  tasks: (() => Promise<T>)[],
  options: {
    maxConcurrent?: number;
    abortOnError?: boolean;
    timeoutMs?: number;
  } = {}
): Promise<T[]> {
  const {
    maxConcurrent = 3,
    abortOnError = false,
    timeoutMs = 60000, // 1 minute default timeout
  } = options;
  
  const results: T[] = [];
  const errors: Error[] = [];
  
  // Process tasks in batches based on concurrency limit
  for (let i = 0; i < tasks.length; i += maxConcurrent) {
    const batch = tasks.slice(i, i + maxConcurrent);
    
    try {
      // Create promises with timeout
      const batchPromises = batch.map(task => {
        return Promise.race([
          task(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Task timed out after ${timeoutMs}ms`)), timeoutMs);
          })
        ]);
      });
      
      // Wait for all promises in the batch
      const batchResults = await Promise.all(
        batchPromises.map(promise => 
          promise.catch(error => {
            if (abortOnError) {
              throw error;
            }
            
            errors.push(error instanceof Error ? error : new Error(String(error)));
            return null;
          })
        )
      );
      
      // Add successful results to the output array
      for (const result of batchResults) {
        if (result !== null) {
          results.push(result as T);
        }
      }
    } catch (error) {
      if (abortOnError) {
        throw error;
      }
    }
  }
  
  // Log errors if any
  if (errors.length > 0 && !abortOnError) {
    logger.warn(`${errors.length} tasks failed during parallel execution`, { 
      errorCount: errors.length,
      firstError: errors[0]?.message
    });
  }
  
  return results;
}
