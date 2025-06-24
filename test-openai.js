// Simple test script for OpenAI integration
// This bypasses TypeScript compilation and directly tests our implementation

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createOpenAIClient } from './src/services/openai/index.js';
import logger from './src/utils/logger.js';

// Load environment variables
dotenv.config();

// Define a simple news format schema
const newsFormat = {
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

// Sample news content for testing
const sampleNewsContent = `
# Latest Breaking News

## Politics
President Trump announced a ceasefire between Israel and Iran today, saying "The ceasefire is in effect." This comes after days of escalating tensions and military strikes between the two nations.

## Technology
Waymo's robotaxis have started carrying passengers in Atlanta, expanding their partnership with Uber. This marks a significant expansion of autonomous vehicle services in the United States.

## Environment
Researchers have noted that the ocean is changing colors due to climate change. Scientists say this indicates significant shifts in marine ecosystems and phytoplankton populations.

## Health
A new study reveals that crash test dummies are still modeled primarily after men despite women facing higher risks in car accidents. Safety advocates are calling for more representative testing protocols.
`;

async function testOpenAI() {
  try {
    logger.info('Starting OpenAI integration test');
    
    // Initialize OpenAI client
    const openaiClient = createOpenAIClient();
    
    // Format news using OpenAI
    logger.info('Formatting news with OpenAI');
    const formattedNews = await openaiClient.structuredAnalysis({
      content: `Here is the latest news content. Please format it into a simple structure with headlines, brief summaries, categories, and sources:\n\n${sampleNewsContent}`,
      functions: [newsFormat],
      functionName: 'format_latest_news',
      systemPrompt: 'You are a news summarization assistant. Extract and format the key news stories from the provided content.'
    });
    
    // Print formatted news
    console.log('\n=== LATEST NEWS ===\n');
    console.log(`Timestamp: ${formattedNews.result.timestamp}\n`);
    
    formattedNews.result.headlines.forEach((headline) => {
      console.log(`[${headline.category.toUpperCase()}] ${headline.title}`);
      console.log(`Summary: ${headline.summary}`);
      if (headline.source) {
        console.log(`Source: ${headline.source}`);
      }
      console.log('');
    });
    
    logger.info('News formatting complete');
    
  } catch (error) {
    logger.error('Test failed:', error);
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the test
testOpenAI().catch(console.error);
