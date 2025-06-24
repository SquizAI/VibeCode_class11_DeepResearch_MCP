import { createFirecrawlClient, extractResearchData } from '../services/firecrawl/index.js';
import { createOpenAIClient, AnalysisFunction } from '../services/openai.js';
import logger from '../utils/logger.js';

/**
 * Example script demonstrating basic research workflow
 * 
 * This script shows how to:
 * 1. Perform deep research using Firecrawl
 * 2. Process the results with OpenAI structured analysis
 */

// Define a schema for structured analysis
const researchSummaryFunction: AnalysisFunction = {
  name: 'summarize_research',
  description: 'Summarize research findings into structured categories',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'A concise title for the research summary'
      },
      keyFindings: {
        type: 'array',
        description: 'The most important findings from the research',
        items: {
          type: 'string'
        }
      },
      categories: {
        type: 'object',
        description: 'Information organized by relevant categories',
        additionalProperties: {
          type: 'string'
        }
      },
      sources: {
        type: 'array',
        description: 'Key sources that provided the information',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            title: { type: 'string' },
            relevance: { 
              type: 'string',
              enum: ['high', 'medium', 'low']
            }
          }
        }
      }
    },
    required: ['title', 'keyFindings', 'categories']
  }
};

// Interface for the structured response
interface ResearchSummary {
  title: string;
  keyFindings: string[];
  categories: Record<string, string>;
  sources?: Array<{
    url: string;
    title: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
}

async function runResearch() {
  try {
    // Initialize clients with rate limiting
    const firecrawlClient = createFirecrawlClient({
      rateLimiting: {
        maxRequestsPerMinute: 30,
        retryCount: 3
      }
    });
    const openaiClient = createOpenAIClient();
    
    // Research query
    const query = 'What are the environmental impacts of electric vehicles compared to gasoline vehicles?';
    
    logger.info(`Starting research on: "${query}"`);
    
    // Step 1: Perform deep research with Firecrawl
    const researchResponse = await firecrawlClient.deepResearch({
      query,
      maxDepth: 3,
      timeLimit: 120,
      maxUrls: 20
    });
    
    logger.info(`Research completed with ID: ${researchResponse.id}`);
    
    // Step 2: Extract the research findings
    const { finalAnalysis, sources } = researchResponse.data;
    
    logger.info(`Obtained research analysis (${finalAnalysis.length} chars) and ${sources?.length || 0} sources`);
    
    // Step 3: Process with OpenAI structured analysis
    const analysisResult = await openaiClient.structuredAnalysis<ResearchSummary>({
      content: `
        Analyze the following research on environmental impacts of electric vs. gasoline vehicles:
        
        ${finalAnalysis}
        
        Extract the key findings and organize them into relevant categories.
      `,
      functions: [researchSummaryFunction],
      functionName: 'summarize_research'
    });
    
    // Step 4: Output the structured results
    const summary = analysisResult.result;
    
    console.log('\n=== RESEARCH SUMMARY ===\n');
    console.log(`Title: ${summary.title}\n`);
    
    console.log('Key Findings:');
    summary.keyFindings.forEach((finding, i) => {
      console.log(`  ${i + 1}. ${finding}`);
    });
    
    console.log('\nCategories:');
    Object.entries(summary.categories).forEach(([category, content]) => {
      console.log(`\n  ${category}:`);
      console.log(`    ${content}`);
    });
    
    if (summary.sources && summary.sources.length > 0) {
      console.log('\nKey Sources:');
      summary.sources
        .filter(source => source.relevance === 'high')
        .forEach((source, i) => {
          console.log(`  ${i + 1}. ${source.title} - ${source.url}`);
        });
    }
    
    logger.info('Research analysis completed successfully');
    
  } catch (error) {
    logger.error('Research failed:', error);
    process.exit(1);
  }
}

// Run the example
runResearch().catch(console.error);
