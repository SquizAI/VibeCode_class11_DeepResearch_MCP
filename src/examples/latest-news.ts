import { createOpenAIClient, researchTools, ToolFunction } from '../services/openai/index.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

/**
 * Latest News Example
 * 
 * This example demonstrates using Firecrawl MCP to fetch the latest news
 * and OpenAI to format it in a simple structure.
 */

// Define a simple news format schema
const newsFormat: ToolFunction = {
  name: 'format_latest_news',
  description: 'Format the latest news into a simple structure',
  parameters: {
    type: 'object',
    properties: {
      headlines: {
        type: 'array',
        description: 'Top news headlines',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Headline title'
            },
            summary: {
              type: 'string',
              description: 'Brief summary of the news (1-2 sentences)'
            },
            category: {
              type: 'string',
              description: 'News category (e.g., politics, technology, health)'
            },
            source: {
              type: 'string',
              description: 'Source of the news'
            }
          },
          required: ['title', 'summary', 'category']
        }
      },
      timestamp: {
        type: 'string',
        description: 'Timestamp of when the news was collected'
      }
    },
    required: ['headlines', 'timestamp']
  }
};

async function getLatestNews() {
  try {
    logger.info('Fetching latest news');
    
    // Use Firecrawl MCP to search for latest news
    // Note: We're using the MCP directly here instead of our client
    // for demonstration purposes
    const searchResponse = await fetch('https://firecrawl-mcp.windsurf.io/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'latest breaking news today',
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      })
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Firecrawl search failed: ${searchResponse.statusText}`);
    }
    
    interface SearchResult {
      results?: Array<{
        title?: string;
        url?: string;
        content?: string;
      }>;
    }
    
    const searchResults = await searchResponse.json() as SearchResult;
    logger.info(`Found ${searchResults.results?.length || 0} news sources`);
    
    // Extract content from search results
    const newsContent = searchResults.results
      ?.filter(result => result.content)
      .map(result => `Source: ${result.title || result.url}\n\n${result.content}`)
      .join('\n\n---\n\n') || '';
    
    if (!newsContent) {
      throw new Error('No news content found');
    }
    
    // Initialize OpenAI client
    const openaiClient = createOpenAIClient();
    
    // Define the news schema
    interface NewsHeadline {
      title: string;
      summary: string;
      category: string;
      source?: string;
    }
    
    interface NewsFormat {
      headlines: NewsHeadline[];
      timestamp: string;
    }
    
    // Format news using OpenAI
    logger.info('Formatting news with OpenAI');
    const formattedNews = await openaiClient.structuredAnalysis<NewsFormat>({
      content: `Here is the latest news content. Please format it into a simple structure with headlines, brief summaries, categories, and sources:\n\n${newsContent}`,
      functions: [newsFormat],
      functionName: 'format_latest_news',
      systemPrompt: 'You are a news summarization assistant. Extract and format the key news stories from the provided content.'
    });
    
    // Print formatted news
    console.log('\n=== LATEST NEWS ===\n');
    console.log(`Timestamp: ${formattedNews.result.timestamp}\n`);
    
    formattedNews.result.headlines.forEach((headline: NewsHeadline) => {
      console.log(`[${headline.category.toUpperCase()}] ${headline.title}`);
      console.log(`Summary: ${headline.summary}`);
      if (headline.source) {
        console.log(`Source: ${headline.source}`);
      }
      console.log('');
    });
    
    logger.info('News fetching and formatting complete');
    
  } catch (error) {
    logger.error('Failed to fetch news:', error);
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the example
getLatestNews().catch(console.error);
