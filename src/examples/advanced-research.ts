import { 
  createFirecrawlClient, 
  DeepResearchOptions,
  ParallelExecutionOptions,
  extractResearchData
} from '../services/firecrawl/index.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Advanced Firecrawl MCP research example
 * 
 * This example demonstrates:
 * 1. Parallel research execution (v1.12.0+)
 * 2. Advanced data extraction
 * 3. Rate limiting and error handling
 */

async function runAdvancedResearch() {
  try {
    // Initialize Firecrawl client with rate limiting
    const firecrawlClient = createFirecrawlClient({
      apiKey: env.FIRECRAWL_API_KEY,
      rateLimiting: {
        maxRequestsPerMinute: 30, // Conservative rate limit
        retryCount: 3,
        retryDelayMs: 2000
      },
      defaultParallelOptions: {
        maxConcurrent: 3,
        abortOnError: false,
        timeoutMs: 180000 // 3 minutes
      }
    });
    
    // Define research topics
    const researchTopics = [
      'What are the environmental impacts of electric vehicles compared to gasoline vehicles?',
      'How does artificial intelligence impact job markets in different industries?',
      'What are the latest advancements in renewable energy storage technologies?'
    ];
    
    logger.info(`Starting parallel research on ${researchTopics.length} topics`);
    
    // Common research options
    const researchOptions: DeepResearchOptions = {
      query: '', // Will be set individually for each topic
      maxDepth: env.MAX_DEPTH,
      timeLimit: env.TIME_LIMIT,
      maxUrls: env.MAX_URLS,
      focusTopics: ['recent developments', 'statistics', 'expert opinions']
    };
    
    // Parallel execution options
    const parallelOptions: ParallelExecutionOptions = {
      maxConcurrent: 2, // Run 2 research tasks in parallel
      abortOnError: false // Continue if one fails
    };
    
    // Start batch research (uses parallel execution)
    const researchResponses = await firecrawlClient.batchResearch(
      researchTopics,
      {
        ...researchOptions,
        ...parallelOptions
      }
    );
    
    logger.info(`Completed ${researchResponses.length} research tasks`);
    
    // Process each research result
    const processedResults = researchResponses.map((response, index) => {
      try {
        // Extract structured data from research
        const extractedData = extractResearchData(response);
        
        logger.info(`Extracted data for topic: "${researchTopics[index].substring(0, 30)}..."`);
        logger.info(`Found ${extractedData.sources.length} sources and ${extractedData.insights.length} insights`);
        
        return {
          topic: researchTopics[index],
          data: extractedData,
          status: 'success'
        };
      } catch (error) {
        logger.error(`Failed to extract data for topic ${index + 1}`, error);
        
        return {
          topic: researchTopics[index],
          error: error instanceof Error ? error.message : String(error),
          status: 'error'
        };
      }
    });
    
    // Display results summary
    console.log('\n=== RESEARCH RESULTS SUMMARY ===\n');
    
    processedResults.forEach((result, index) => {
      console.log(`Topic ${index + 1}: ${result.topic}`);
      console.log(`Status: ${result.status}`);
      
      if (result.status === 'success' && result.data) {
        console.log(`Summary: ${result.data.summary.substring(0, 150)}...`);
        console.log(`Sources: ${result.data.sources.length}`);
        console.log(`Top domains: ${result.data.metadata.topDomains.join(', ')}`);
        console.log(`Query time: ${result.data.metadata.queryTime} seconds`);
        
        // Display top insights
        console.log('\nTop Insights:');
        result.data.insights
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3)
          .forEach((insight, i) => {
            console.log(`  ${i + 1}. ${insight.topic} (confidence: ${Math.round(insight.confidence * 100)}%)`);
          });
      } else if (result.error) {
        console.log(`Error: ${result.error}`);
      }
      
      console.log('\n---\n');
    });
    
    logger.info('Advanced research example completed successfully');
    
  } catch (error) {
    logger.error('Research failed:', error);
    process.exit(1);
  }
}

// Run the example
runAdvancedResearch().catch(console.error);
