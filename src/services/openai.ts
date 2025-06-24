import OpenAI from 'openai';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { OpenAIError, handleApiError } from '../utils/errors.js';

/**
 * OpenAI API client
 * 
 * This module provides a type-safe interface to the OpenAI API
 * for structured analysis of research data.
 */

// Types for OpenAI function calling
export interface AnalysisFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface StructuredAnalysisOptions {
  content: string;
  functions: AnalysisFunction[];
  functionName?: string;
  model?: string;
  temperature?: number;
}

export interface StructuredAnalysisResult<T = unknown> {
  functionName: string;
  result: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface OpenAIClient {
  structuredAnalysis: <T = unknown>(options: StructuredAnalysisOptions) => Promise<StructuredAnalysisResult<T>>;
}

/**
 * Creates an OpenAI client with the configured API key
 */
export function createOpenAIClient(): OpenAIClient {
  const apiKey = env.OPENAI_API_KEY;
  
  // Validate API key
  if (!apiKey) {
    throw new OpenAIError('API key is required');
  }
  
  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey,
  });
  
  return {
    /**
     * Performs structured analysis using OpenAI function calling
     */
    async structuredAnalysis<T = unknown>(
      options: StructuredAnalysisOptions
    ): Promise<StructuredAnalysisResult<T>> {
      const { 
        content, 
        functions, 
        functionName,
        model = env.OPENAI_MODEL, 
        temperature = 0.2 
      } = options;
      
      try {
        logger.debug(`Performing structured analysis with model: ${model}`);
        
        // Prepare function calling parameters
        const tools = functions.map(func => ({
          type: 'function' as const,
          function: {
            name: func.name,
            description: func.description,
            parameters: func.parameters,
          }
        }));
        
        // Configure tool choice if a specific function is requested
        const toolChoice = functionName ? {
          type: 'function' as const,
          function: { name: functionName }
        } : 'auto';
        
        // Make API request
        const response = await client.chat.completions.create({
          model,
          temperature,
          messages: [
            {
              role: 'system',
              content: 'You are a research analysis assistant that processes information and extracts structured data.'
            },
            {
              role: 'user',
              content
            }
          ],
          tools,
          tool_choice: toolChoice,
        });
        
        // Extract function call results
        const toolCalls = response.choices[0]?.message.tool_calls;
        
        if (!toolCalls || toolCalls.length === 0) {
          throw new OpenAIError('No function was called in the response');
        }
        
        const functionCall = toolCalls[0];
        
        if (functionCall.type !== 'function') {
          throw new OpenAIError(`Unexpected tool call type: ${functionCall.type}`);
        }
        
        // Parse function arguments
        let parsedArguments: T;
        try {
          parsedArguments = JSON.parse(functionCall.function.arguments) as T;
        } catch (error) {
          throw new OpenAIError(`Failed to parse function arguments: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Return structured result
        return {
          functionName: functionCall.function.name,
          result: parsedArguments,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          }
        };
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw error;
        }
        return handleApiError(error, 'OpenAI');
      }
    }
  };
}
