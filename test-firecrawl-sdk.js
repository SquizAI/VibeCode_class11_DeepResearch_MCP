// Test script using Firecrawl SDK and OpenAI integration
// This demonstrates the full workflow using the official SDKs

import dotenv from 'dotenv';
import OpenAI from 'openai';
import FirecrawlApp from '@mendable/firecrawl-js';

// Load environment variables
dotenv.config();

// Define a simple research format schema
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

async function testFirecrawlSdk() {
  try {
    console.log('Starting integration test with Firecrawl SDK and OpenAI');
    
    // Initialize Firecrawl client with API key from environment variables
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }
    
    const firecrawl = new FirecrawlApp({
      apiKey: firecrawlApiKey
    });
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Step 1: Use Firecrawl SDK to perform deep research
    console.log('Starting deep research with Firecrawl SDK...');
    
    const researchQuery = "What are the latest developments in autonomous vehicle technology?";
    // Using the deep_research MCP function through Firecrawl SDK
    const researchResponse = await firecrawl.deepResearch(researchQuery, {
      maxDepth: 3,
      timeLimit: 120,
      maxUrls: 10
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
      finalResponse = await firecrawl.checkDeepResearchStatus(researchResponse.id);
      attempts++;
      
      console.log(`Current status: ${finalResponse.status}`);
    }
    
    if (finalResponse.status !== 'completed') {
      console.log('Research did not complete in the allotted time. Using partial results.');
    }
    
    // Step 3: Format research results using OpenAI
    console.log('Formatting research results with OpenAI...');
    
    const analysisContent = finalResponse.data?.finalAnalysis || 'No final analysis available yet.';
    
    // Extract sources if available
    const sources = finalResponse.data?.sources?.map(source => 
      `${source.title || 'Unknown'}: ${source.url}`
    ).join('\n') || 'No sources available.';
    
    const formattedResearchResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a research summarization assistant. Extract and format the key findings from the provided research analysis."
        },
        {
          role: "user",
          content: `Here is the deep research analysis on "${researchQuery}". Please format it into a structured summary with key findings, categories, and sources:\n\nAnalysis:\n${analysisContent}\n\nSources:\n${sources}`
        }
      ],
      tools: [{
        type: "function",
        function: researchFormat
      }],
      tool_choice: {
        type: "function",
        function: {
          name: "format_research_results"
        }
      }
    });
    
    // Extract the formatted research
    const formattedResearchTool = formattedResearchResponse.choices[0].message.tool_calls?.[0];
    if (!formattedResearchTool || formattedResearchTool.type !== "function" || !formattedResearchTool.function) {
      throw new Error("No valid tool call found in the formatted research response");
    }
    
    const formattedResearch = JSON.parse(formattedResearchTool.function.arguments);
    
    // Print formatted research
    console.log('\n=== RESEARCH FINDINGS ===\n');
    console.log(`Query: ${researchQuery}`);
    console.log(`Timestamp: ${formattedResearch.timestamp}\n`);
    
    formattedResearch.mainFindings.forEach((finding) => {
      console.log(`[${finding.category.toUpperCase()}] ${finding.title}`);
      console.log(`Summary: ${finding.summary}`);
      if (finding.sources && finding.sources.length > 0) {
        console.log(`Sources: ${finding.sources.join(', ')}`);
      }
      console.log('');
    });
    
    // Log token usage if available
    if (formattedResearchResponse.usage) {
      console.log('\nToken Usage:');
      console.log(`- Prompt tokens: ${formattedResearchResponse.usage.prompt_tokens}`);
      console.log(`- Completion tokens: ${formattedResearchResponse.usage.completion_tokens}`);
      console.log(`- Total tokens: ${formattedResearchResponse.usage.total_tokens}`);
    }
    
    console.log('\nResearch formatting complete');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
testFirecrawlSdk().catch(console.error);
