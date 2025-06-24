// Test script using our own Firecrawl and OpenAI services
// This demonstrates the integration between our services without using Cascade tools

import dotenv from 'dotenv';
import { createFirecrawlClient } from './src/services/firecrawl.js';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Define a simple news format schema
const newsFormat = {
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

async function testServices() {
  try {
    console.log('Starting integration test with our Firecrawl and OpenAI services');
    
    // Initialize our Firecrawl client
    const firecrawlClient = createFirecrawlClient();
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Step 1: Use our Firecrawl service to perform deep research
    console.log('Starting deep research with Firecrawl service...');
    
    const researchQuery = "What are the latest developments in autonomous vehicle technology?";
    const researchResponse = await firecrawlClient.deepResearch({
      query: researchQuery,
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
      finalResponse = await firecrawlClient.checkResearchStatus(researchResponse.id);
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
        function: newsFormat
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
    
    formattedResearch.mainFindings.forEach((finding, index) => {
      console.log(`[${finding.category.toUpperCase()}] ${finding.title}`);
      console.log(`Summary: ${finding.summary}`);
      if (finding.sources && finding.sources.length > 0) {
        console.log(`Sources: ${finding.sources.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('Research formatting complete');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testServices().catch(console.error);
