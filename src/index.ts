import { env } from './config/env.js';
import logger from './utils/logger.js';
import { createFirecrawlClient, extractResearchData } from './services/firecrawl/index.js';
import { createOpenAIClient } from './services/openai.js';
import { AppError } from './utils/errors.js';

/**
 * Deep Research Tool
 * 
 * Main application entry point that integrates Firecrawl MCP for web scraping
 * and OpenAI's function calling for structured analysis.
 * 
 * Features:
 * - Firecrawl MCP v1.12.0 with parallel execution
 * - Advanced data extraction and processing
 * - Rate limiting and comprehensive error handling
 * - OpenAI structured analysis with function calling
 */

async function main() {
  try {
    logger.info('Starting Deep Research Tool');
    
    // Initialize Firecrawl client with rate limiting
    const firecrawlClient = createFirecrawlClient({
      rateLimiting: {
        maxRequestsPerMinute: 30,
        retryCount: 3
      },
      defaultParallelOptions: {
        maxConcurrent: 3,
        abortOnError: false
      }
    });
    
    // Initialize OpenAI client
    const openaiClient = createOpenAIClient();
    
    logger.info('API clients initialized successfully');
    logger.info(`Server configured to run on port ${env.PORT}`);
    
    // Log configuration (without sensitive data)
    logger.info('Application configuration:', {
      environment: env.NODE_ENV,
      openaiModel: env.OPENAI_MODEL,
      researchConfig: {
        maxDepth: env.MAX_DEPTH,
        maxUrls: env.MAX_URLS,
        timeLimit: env.TIME_LIMIT,
      },
      firecrawlVersion: 'v1.12.0',
      parallelExecution: true
    });
    
    // Ready for integration
    logger.info('Deep Research Tool is ready for integration');
    logger.info('Available examples:');
    logger.info('- Basic research: npm run dev -- --example=basic');
    logger.info('- Advanced research: npm run dev -- --example=advanced');
    
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Application error: ${error.message}`, { 
        statusCode: error.statusCode,
        stack: error.stack 
      });
    } else if (error instanceof Error) {
      logger.error(`Unexpected error: ${error.message}`, { 
        stack: error.stack 
      });
    } else {
      logger.error('Unknown error occurred', { error });
    }
    
    process.exit(1);
  }
}

// Run the application
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
