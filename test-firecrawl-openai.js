// Comprehensive test script for OpenAI integration with Firecrawl MCP
// This uses the actual Firecrawl MCP through Cascade's tools

import dotenv from 'dotenv';
import OpenAI from 'openai';
import fetch from 'node-fetch';

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

async function testFirecrawlOpenAI() {
  try {
    console.log('Starting OpenAI integration test with real Firecrawl MCP');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Step 1: Use Firecrawl MCP directly to search for latest news
    console.log('Fetching latest news using Firecrawl MCP...');
    
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
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
    
    const searchResults = await searchResponse.json();
    console.log(`Found ${searchResults.results?.length || 0} news sources`);
    
    // Extract content from search results
    const newsContent = searchResults.results
      ?.filter(result => result.content)
      .map(result => `Source: ${result.title || result.url}\n\n${result.content}`)
      .join('\n\n---\n\n') || '';
    
    if (!newsContent) {
      throw new Error('No news content found');
    }
    
    // Step 2: Format news using OpenAI
    console.log('Formatting news with OpenAI...');
    const formattedNewsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a news summarization assistant. Extract and format the key news stories from the provided content."
        },
        {
          role: "user",
          content: `Here is the latest news content. Please format it into a simple structure with headlines, brief summaries, categories, and sources:\n\n${newsContent}`
        }
      ],
      tools: [{
        type: "function",
        function: newsFormat
      }],
      tool_choice: {
        type: "function",
        function: {
          name: "format_latest_news"
        }
      }
    });
    
    // Extract the formatted news
    const formattedNewsTool = formattedNewsResponse.choices[0].message.tool_calls?.[0];
    if (!formattedNewsTool || formattedNewsTool.type !== "function" || !formattedNewsTool.function) {
      throw new Error("No valid tool call found in the formatted news response");
    }
    
    const formattedNews = JSON.parse(formattedNewsTool.function.arguments);
    
    // Print formatted news
    console.log('\n=== LATEST NEWS ===\n');
    console.log(`Timestamp: ${formattedNews.timestamp}\n`);
    
    formattedNews.headlines.forEach((headline) => {
      console.log(`[${headline.category.toUpperCase()}] ${headline.title}`);
      console.log(`Summary: ${headline.summary}`);
      if (headline.source) {
        console.log(`Source: ${headline.source}`);
      }
      console.log('');
    });
    
    console.log('News formatting complete');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testFirecrawlOpenAI().catch(console.error);
