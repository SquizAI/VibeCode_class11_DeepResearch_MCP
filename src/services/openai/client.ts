import OpenAI from 'openai';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';
import { OpenAIError, handleApiError } from '../../utils/errors.js';
import {
  AnalysisOptions,
  AnalysisResult,
  OpenAIClient,
  OpenAIModel,
  ParallelAnalysisOptions,
  StreamChunk,
  StructuredAnalysisOptions,
  StructuredAnalysisResult,
  TokenUsage,
  analysisOptionsSchema,
  parallelAnalysisOptionsSchema,
  structuredAnalysisOptionsSchema
} from './types.js';
import {
  combineStreamChunks,
  executeParallelTasks,
  extractTokenUsage,
  formatStructuredResult,
  safeJsonParse,
  validateWithSchema
} from './utils.js';

/**
 * Creates an OpenAI client with the configured API key
 * 
 * Features:
 * - Streaming support for real-time responses
 * - Parallel execution for multiple requests
 * - Schema validation for structured data
 * - Support for multiple models including search capabilities
 */
export function createOpenAIClient(): OpenAIClient {
  const apiKey = env.OPENAI_API_KEY;
  
  // Validate API key
  if (!apiKey) {
    throw new OpenAIError('OpenAI API key is required');
  }
  
  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey,
  });
  
  return {
    /**
     * Performs text analysis using OpenAI
     */
    async analyze(options: AnalysisOptions): Promise<AnalysisResult> {
      try {
        // Validate options
        const { data: validOptions } = validateWithSchema(options, analysisOptionsSchema);
        
        const {
          content,
          systemPrompt = 'You are a helpful research assistant.',
          model = env.OPENAI_MODEL || OpenAIModel.GPT4O_LATEST,
          temperature = 0.2,
          maxTokens,
          tools,
          toolChoice,
        } = validOptions;
        
        logger.debug(`Performing analysis with model: ${model}`);
        
        // Make API request
        const response = await client.chat.completions.create({
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content
            }
          ],
          tools,
          tool_choice: toolChoice,
        });
        
        const responseContent = response.choices[0]?.message.content || '';
        const usage = extractTokenUsage(response.usage);
        
        return {
          content: responseContent,
          usage
        };
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw error;
        }
        return handleApiError(error, 'OpenAI');
      }
    },
    
    /**
     * Streams text analysis using OpenAI
     */
    async *analyzeStream(options: AnalysisOptions): AsyncGenerator<StreamChunk, void, unknown> {
      try {
        // Validate options
        const { data: validOptions } = validateWithSchema(options, analysisOptionsSchema);
        
        const {
          content,
          systemPrompt = 'You are a helpful research assistant.',
          model = env.OPENAI_MODEL || OpenAIModel.GPT4O_LATEST,
          temperature = 0.2,
          maxTokens,
          tools,
          toolChoice,
        } = validOptions;
        
        logger.debug(`Streaming analysis with model: ${model}`);
        
        // Make streaming API request
        const stream = await client.chat.completions.create({
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content
            }
          ],
          tools,
          tool_choice: toolChoice,
          stream: true,
        });
        
        // Process the stream
        let isComplete = false;
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          const toolCalls = chunk.choices[0]?.delta?.tool_calls;
          
          // Extract function call information if present
          let functionName: string | undefined;
          let functionArguments: string | undefined;
          
          if (toolCalls && toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            if (toolCall.type === 'function') {
              if (toolCall.function.name) {
                functionName = toolCall.function.name;
              }
              if (toolCall.function.arguments) {
                functionArguments = toolCall.function.arguments;
              }
            }
          }
          
          // Check if this is the final chunk
          isComplete = chunk.choices[0]?.finish_reason !== null;
          
          yield {
            content: content || undefined,
            functionName,
            functionArguments,
            isComplete
          };
        }
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw error;
        }
        throw handleApiError(error, 'OpenAI');
      }
    },
    
    /**
     * Performs structured analysis using OpenAI function calling
     */
    async structuredAnalysis<T = unknown>(
      options: StructuredAnalysisOptions<T>
    ): Promise<StructuredAnalysisResult<T>> {
      try {
        // Validate options
        const { data: validOptions } = validateWithSchema(options, structuredAnalysisOptionsSchema);
        
        const { 
          content, 
          functions, 
          functionName,
          systemPrompt = 'You are a research analysis assistant that processes information and extracts structured data.',
          model = env.OPENAI_MODEL || OpenAIModel.GPT4O_LATEST,
          temperature = 0.2,
          schema
        } = validOptions;
        
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
              content: systemPrompt
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
        const parsedArguments = safeJsonParse<T>(functionCall.function.arguments);
        
        // Validate against schema if provided
        let validationResult;
        if (schema) {
          validationResult = validateWithSchema(parsedArguments, schema);
        }
        
        // Extract token usage
        const usage = extractTokenUsage(response.usage);
        
        // Return structured result
        return formatStructuredResult(
          functionCall.function.name,
          validationResult?.data || parsedArguments,
          usage,
          validationResult?.errors
        );
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw error;
        }
        return handleApiError(error, 'OpenAI');
      }
    },
    
    /**
     * Streams structured analysis using OpenAI function calling
     */
    async *structuredAnalysisStream<T = unknown>(
      options: StructuredAnalysisOptions<T>
    ): AsyncGenerator<StreamChunk, StructuredAnalysisResult<T>, unknown> {
      try {
        // Validate options
        const { data: validOptions } = validateWithSchema(options, structuredAnalysisOptionsSchema);
        
        const { 
          content, 
          functions, 
          functionName,
          systemPrompt = 'You are a research analysis assistant that processes information and extracts structured data.',
          model = env.OPENAI_MODEL || OpenAIModel.GPT4O_LATEST,
          temperature = 0.2,
          schema
        } = validOptions;
        
        logger.debug(`Streaming structured analysis with model: ${model}`);
        
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
        
        // Make streaming API request
        const stream = await client.chat.completions.create({
          model,
          temperature,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content
            }
          ],
          tools,
          tool_choice: toolChoice,
          stream: true,
        });
        
        // Process the stream
        const chunks: StreamChunk[] = [];
        let tokenUsage: TokenUsage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          const toolCalls = chunk.choices[0]?.delta?.tool_calls;
          
          // Extract function call information if present
          let functionName: string | undefined;
          let functionArguments: string | undefined;
          
          if (toolCalls && toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            if (toolCall.type === 'function') {
              if (toolCall.function.name) {
                functionName = toolCall.function.name;
              }
              if (toolCall.function.arguments) {
                functionArguments = toolCall.function.arguments;
              }
            }
          }
          
          // Check if this is the final chunk
          const isComplete = chunk.choices[0]?.finish_reason !== null;
          
          // Create and store the chunk
          const streamChunk: StreamChunk = {
            content: content || undefined,
            functionName,
            functionArguments,
            isComplete
          };
          
          chunks.push(streamChunk);
          
          // Yield the chunk to the consumer
          yield streamChunk;
          
          // Update token usage if available
          if (chunk.usage) {
            tokenUsage = extractTokenUsage(chunk.usage);
          }
        }
        
        // Combine all chunks to get the complete response
        const combined = combineStreamChunks(chunks);
        
        if (!combined.functionName || !combined.functionArguments) {
          throw new OpenAIError('No complete function call was found in the stream');
        }
        
        // Parse function arguments
        const parsedArguments = safeJsonParse<T>(combined.functionArguments);
        
        // Validate against schema if provided
        let validationResult;
        if (schema) {
          validationResult = validateWithSchema(parsedArguments, schema);
        }
        
        // Return the final structured result
        return formatStructuredResult(
          combined.functionName,
          validationResult?.data || parsedArguments,
          tokenUsage,
          validationResult?.errors
        );
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw error;
        }
        throw handleApiError(error, 'OpenAI');
      }
    },
    
    /**
     * Executes multiple analysis tasks in parallel
     */
    async parallelAnalysis(options: ParallelAnalysisOptions): Promise<AnalysisResult[]> {
      try {
        // Validate options
        const { data: validOptions } = validateWithSchema(options, parallelAnalysisOptionsSchema);
        
        const {
          tasks,
          maxConcurrent = 3,
          abortOnError = false,
          timeoutMs = 60000 // 1 minute default timeout
        } = validOptions;
        
        logger.debug(`Executing ${tasks.length} analysis tasks in parallel (max concurrent: ${maxConcurrent})`);
        
        // Create task functions
        const taskFunctions = tasks.map(taskOptions => {
          return async () => this.analyze(taskOptions);
        });
        
        // Execute tasks in parallel with concurrency control
        return executeParallelTasks(taskFunctions, {
          maxConcurrent,
          abortOnError,
          timeoutMs
        });
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw error;
        }
        return handleApiError(error, 'OpenAI');
      }
    }
  };
}
