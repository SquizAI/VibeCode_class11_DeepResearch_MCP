import { z } from 'zod';

/**
 * OpenAI API types and schemas
 * 
 * This module defines the types and validation schemas for the OpenAI API integration.
 */

// Available OpenAI models
export enum OpenAIModel {
  GPT4O = 'gpt-4o',
  GPT4O_LATEST = 'gpt-4o-latest',
  GPT4O_SEARCH = 'gpt-4o-search-preview',
}

// Function calling types
export interface ToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolDefinition {
  type: 'function';
  function: ToolFunction;
}

export type ToolChoice = 'auto' | 'none' | { type: 'function'; function: { name: string } };

// Request options
export interface AnalysisOptions {
  content: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  toolChoice?: ToolChoice;
  stream?: boolean;
}

export interface StructuredAnalysisOptions<T = unknown> extends AnalysisOptions {
  functions: ToolFunction[];
  functionName?: string;
  schema?: z.ZodType<T>;
}

export interface ParallelAnalysisOptions {
  tasks: AnalysisOptions[];
  maxConcurrent?: number;
  abortOnError?: boolean;
  timeoutMs?: number;
}

// Response types
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AnalysisResult {
  content: string;
  usage: TokenUsage;
}

export interface StructuredAnalysisResult<T = unknown> {
  functionName: string;
  result: T;
  usage: TokenUsage;
  validationErrors?: z.ZodError;
}

export interface StreamChunk {
  content?: string;
  functionName?: string;
  functionArguments?: string;
  isComplete: boolean;
}

// Client interface
export interface OpenAIClient {
  analyze: (options: AnalysisOptions) => Promise<AnalysisResult>;
  analyzeStream: (options: AnalysisOptions) => AsyncGenerator<StreamChunk, void, unknown>;
  structuredAnalysis: <T = unknown>(options: StructuredAnalysisOptions<T>) => Promise<StructuredAnalysisResult<T>>;
  structuredAnalysisStream: <T = unknown>(options: StructuredAnalysisOptions<T>) => AsyncGenerator<StreamChunk, StructuredAnalysisResult<T>, unknown>;
  parallelAnalysis: <T = unknown>(options: ParallelAnalysisOptions) => Promise<AnalysisResult[]>;
}

// Validation schemas
export const tokenUsageSchema = z.object({
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export const analysisOptionsSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  systemPrompt: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  tools: z.array(
    z.object({
      type: z.literal('function'),
      function: z.object({
        name: z.string().min(1),
        description: z.string(),
        parameters: z.record(z.unknown()),
      }),
    })
  ).optional(),
  toolChoice: z.union([
    z.literal('auto'),
    z.literal('none'),
    z.object({
      type: z.literal('function'),
      function: z.object({
        name: z.string().min(1),
      }),
    }),
  ]).optional(),
  stream: z.boolean().optional(),
});

export const structuredAnalysisOptionsSchema = analysisOptionsSchema.extend({
  functions: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string(),
      parameters: z.record(z.unknown()),
    })
  ),
  functionName: z.string().optional(),
  schema: z.custom<z.ZodType>((val) => val instanceof z.ZodType).optional(),
});

export const parallelAnalysisOptionsSchema = z.object({
  tasks: z.array(analysisOptionsSchema).min(1),
  maxConcurrent: z.number().int().positive().optional(),
  abortOnError: z.boolean().optional(),
  timeoutMs: z.number().int().positive().optional(),
});
