// Simple test script for OpenAI integration with Firecrawl MCP
// This directly uses the OpenAI API and Firecrawl MCP without TypeScript compilation

import dotenv from 'dotenv';
import OpenAI from 'openai';

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

async function testMCP() {
  try {
    console.log('Starting OpenAI integration test with Firecrawl MCP');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Use Firecrawl MCP to search for latest news
    console.log('Fetching latest news using Firecrawl MCP...');
    
    // Define MCP tool for Firecrawl search
    const firecrawlTool = {
      type: "function",
      function: {
        name: "firecrawl_search",
        description: "Search the web and optionally extract content from search results.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query string"
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 5)"
            },
            scrapeOptions: {
              type: "object",
              description: "Options for scraping search results",
              properties: {
                formats: {
                  type: "array",
                  description: "Content formats to extract from search results",
                  items: {
                    type: "string",
                    enum: ["markdown", "html", "rawHtml"]
                  }
                },
                onlyMainContent: {
                  type: "boolean",
                  description: "Extract only the main content from results"
                }
              }
            }
          },
          required: ["query"]
        }
      }
    };
    
    // Step 1: Use Firecrawl MCP to search for latest news
    const searchResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a research assistant that helps find the latest news. Use the firecrawl_search tool to find breaking news from today."
        },
        {
          role: "user",
          content: "Find the latest breaking news from today. Focus on major headlines across politics, technology, health, and environment."
        }
      ],
      tools: [firecrawlTool],
      tool_choice: {
        type: "function",
        function: {
          name: "firecrawl_search"
        }
      }
    });
    
    // Extract the tool call arguments
    const toolCall = searchResponse.choices[0].message.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function" || !toolCall.function) {
      throw new Error("No valid tool call found in the response");
    }
    
    const searchArgs = JSON.parse(toolCall.function.arguments);
    console.log(`Search query: ${searchArgs.query}`);
    console.log(`Limit: ${searchArgs.limit || 5}`);
    
    // Step 2: Simulate getting search results from Firecrawl MCP
    console.log("Simulating search results from Firecrawl MCP...");
    
    // Sample news content for testing
    const sampleNewsContent = `
    # Latest Breaking News - June 24, 2025
    
    ## Politics
    President Trump announced a ceasefire between Israel and Iran today, saying "The ceasefire is in effect." This comes after days of escalating tensions and military strikes between the two nations.
    
    ## Technology
    Waymo's robotaxis have started carrying passengers in Atlanta, expanding their partnership with Uber. This marks a significant expansion of autonomous vehicle services in the United States.
    
    ## Environment
    Researchers have noted that the ocean is changing colors due to climate change. Scientists say this indicates significant shifts in marine ecosystems and phytoplankton populations.
    
    ## Health
    A new study reveals that crash test dummies are still modeled primarily after men despite women facing higher risks in car accidents. Safety advocates are calling for more representative testing protocols.
    `;
    
    // Step 3: Format news using OpenAI
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
          content: `Here is the latest news content. Please format it into a simple structure with headlines, brief summaries, categories, and sources:\n\n${sampleNewsContent}`
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
testMCP().catch(console.error);
