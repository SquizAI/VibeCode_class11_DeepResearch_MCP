/**
 * Custom error classes for better error handling throughout the application
 */

// Base application error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// API integration errors
export class ApiError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(message: string, service: string, statusCode = 500, originalError?: Error) {
    super(`${service} API Error: ${message}`, statusCode, true);
    this.service = service;
    this.originalError = originalError;
    
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Firecrawl specific errors
export class FirecrawlError extends ApiError {
  constructor(message: string, statusCode = 500, originalError?: Error) {
    super(message, 'Firecrawl', statusCode, originalError);
    
    Object.setPrototypeOf(this, FirecrawlError.prototype);
  }
}

// OpenAI specific errors
export class OpenAIError extends ApiError {
  constructor(message: string, statusCode = 500, originalError?: Error) {
    super(message, 'OpenAI', statusCode, originalError);
    
    Object.setPrototypeOf(this, OpenAIError.prototype);
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Configuration errors
export class ConfigError extends AppError {
  constructor(message: string) {
    super(`Configuration Error: ${message}`, 500, true);
    
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

// Helper function to handle API errors
export function handleApiError(error: unknown, serviceName: string): never {
  if (error instanceof Error) {
    if (serviceName === 'Firecrawl') {
      throw new FirecrawlError(error.message, 500, error);
    } else if (serviceName === 'OpenAI') {
      throw new OpenAIError(error.message, 500, error);
    } else {
      throw new ApiError(error.message, serviceName, 500, error);
    }
  }
  
  // If it's not an Error instance
  throw new ApiError('Unknown error occurred', serviceName, 500);
}
