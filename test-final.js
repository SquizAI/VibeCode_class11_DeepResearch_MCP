// Final test script for Firecrawl MCP and OpenAI integration
// Using direct service implementation

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Validate environment variables
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!FIRECRAWL_API_KEY) {
  console.error('FIRECRAWL_API_KEY is required');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required');
  process.exit(1);
}

// Constants
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v1';
const MAX_DEPTH = 3;
const TIME_LIMIT = 120;
const MAX_URLS = 10;

// Create a simple Firecrawl service client
const firecrawlService = {
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${FIRECRAWL_BASE_URL}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    };
    
    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
    
    console.log(`Making ${method} request to ${endpoint}`);
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firecrawl API request failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Firecrawl API request failed:', error);
      throw error;
    }
  },
  
  async deepResearch(options) {
    const { query, maxDepth = MAX_DEPTH, timeLimit = TIME_LIMIT, maxUrls = MAX_URLS } = options;
    
    return this.makeRequest('/deep-research', 'POST', {
      query,
      maxDepth,
      timeLimit,
      maxUrls,
    });
  },
  
  async checkResearchStatus(id) {
    return this.makeRequest(`/deep-research/${id}`);
  }
};

// Create a simple OpenAI service client
const openaiService = {
  client: new OpenAI({
    apiKey: OPENAI_API_KEY,
  }),
  
  async structuredAnalysis(content, schema) {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a research analysis assistant. Format the provided research into a structured summary."
          },
          {
            role: "user",
            content: content
          }
        ],
        tools: [{
          type: "function",
          function: schema
        }],
        tool_choice: {
          type: "function",
          function: {
            name: schema.name
          }
        }
      });
      
      const toolCall = response.choices[0].message.tool_calls?.[0];
      if (!toolCall || toolCall.type !== "function" || !toolCall.function) {
        throw new Error("No valid tool call found in the response");
      }
      
      return {
        result: JSON.parse(toolCall.function.arguments),
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }
};

// Define research format schema
const researchFormat = {
  name: 'format_research_results',
  description: 'Format deep research results into a structured summary',
  parameters: {
    type: 'object',
    properties: {
      mainFindings: {
        type: 'array',
        description: 'Key findings from the research',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the finding'
            },
            summary: {
              type: 'string',
              description: 'Brief summary of the finding (1-2 sentences)'
            },
            category: {
              type: 'string',
              description: 'Category (e.g., technology, health, environment)'
            },
            sources: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Sources supporting this finding'
            }
          },
          required: ['title', 'summary', 'category']
        }
      },
      timestamp: {
        type: 'string',
        description: 'Timestamp of when the research was conducted'
      }
    },
    required: ['mainFindings', 'timestamp']
  }
};

// Main function to run the test
async function runTest() {
  try {
    console.log('Starting final integration test with Firecrawl and OpenAI services');
    
    // Step 1: Use Firecrawl service to perform deep research
    console.log('Starting deep research with Firecrawl service...');
    
    const researchQuery = "What are the latest advancements in artificial intelligence for climate change?";
    const researchResponse = await firecrawlService.deepResearch({
      query: researchQuery
    });
    
    console.log(`Research initiated with ID: ${researchResponse.id}`);
    console.log(`Initial status: ${researchResponse.status}`);
    
    // Step 2: Poll for research completion
    console.log('Polling for research completion...');
    
    let finalResponse = researchResponse;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (finalResponse.status !== 'completed' && attempts < maxAttempts) {
      console.log(`Waiting for research to complete (attempt ${attempts + 1}/${maxAttempts})...`);
      
      // Wait for 10 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check research status
      finalResponse = await firecrawlService.checkResearchStatus(researchResponse.id);
      attempts++;
      
      console.log(`Current status: ${finalResponse.status}`);
    }
    
    if (finalResponse.status !== 'completed') {
      console.log('Research did not complete in the allotted time. Using partial results.');
    }
    
    // Step 3: Format research results using OpenAI service
    console.log('Formatting research results with OpenAI service...');
    
    const analysisContent = finalResponse.data?.finalAnalysis || 'No final analysis available yet.';
    
    // Extract sources if available
    const sources = finalResponse.data?.sources?.map(source => 
      `${source.title || 'Unknown'}: ${source.url}`
    ).join('\n') || 'No sources available.';
    
    const formattedResearch = await openaiService.structuredAnalysis(
      `Here is the deep research analysis on "${researchQuery}". Please format it into a structured summary with key findings, categories, and sources:\n\nAnalysis:\n${analysisContent}\n\nSources:\n${sources}`,
      researchFormat
    );
    
    // Print formatted research
    console.log('\n=== RESEARCH FINDINGS ===\n');
    console.log(`Query: ${researchQuery}`);
    console.log(`Timestamp: ${formattedResearch.result.timestamp}\n`);
    
    formattedResearch.result.mainFindings.forEach((finding) => {
      console.log(`[${finding.category.toUpperCase()}] ${finding.title}`);
      console.log(`Summary: ${finding.summary}`);
      if (finding.sources && finding.sources.length > 0) {
        console.log(`Sources: ${finding.sources.join(', ')}`);
      }
      console.log('');
    });
    
    // Log token usage if available
    if (formattedResearch.usage) {
      console.log('\nToken Usage:');
      console.log(`- Prompt tokens: ${formattedResearch.usage.prompt_tokens}`);
      console.log(`- Completion tokens: ${formattedResearch.usage.completion_tokens}`);
      console.log(`- Total tokens: ${formattedResearch.usage.total_tokens}`);
    }
    
    console.log('\nResearch formatting complete');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
runTest().catch(console.error);
