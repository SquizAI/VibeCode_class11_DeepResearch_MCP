// Test script for OpenAI integration with Firecrawl MCP using Cascade
// This uses the Firecrawl MCP through Cascade's tools

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

// Sample news content for testing
// This simulates what we would get from Firecrawl MCP
const sampleNewsContent = `
Source: CNN Politics

# Trump Announces Ceasefire Between Israel and Iran

Former President Donald Trump announced today that a ceasefire has been brokered between Israel and Iran, stating, "The ceasefire is in effect." This development comes after several days of escalating tensions and military exchanges between the two nations.

The announcement was made during a press conference at Mar-a-Lago, where Trump claimed to have been in communication with leaders from both countries. International observers remain cautious about the durability of the agreement.

---

Source: TechCrunch

# Waymo Expands Robotaxi Service to Atlanta in Partnership with Uber

Waymo, Alphabet's autonomous vehicle subsidiary, has officially launched its robotaxi service in Atlanta, Georgia, expanding its partnership with Uber. This marks a significant milestone in the deployment of autonomous vehicle technology in urban environments.

The expansion follows successful operations in Phoenix and San Francisco, with Atlanta representing the company's first major presence in the southeastern United States. Initial service will cover downtown Atlanta and surrounding neighborhoods, with plans to expand coverage in the coming months.

---

Source: National Geographic

# Study Finds Oceans Changing Color Due to Climate Change

Scientists have documented that the world's oceans are changing color, a phenomenon they attribute directly to climate change. According to research published in the journal Nature, shifts in ocean color indicate significant changes in marine ecosystems and phytoplankton populations.

The study utilized satellite data spanning over two decades to track subtle changes in ocean hue, finding that tropical regions are becoming greener while polar waters show increasing blue tints. These changes reflect alterations in the types and quantities of phytoplankton, which form the base of marine food webs.

---

Source: The New York Times

# Crash Test Dummies Still Modeled After Men Despite Higher Risks for Women

A comprehensive new study reveals that crash test dummies used in vehicle safety testing continue to be modeled primarily after male body types, despite evidence that women face significantly higher risks of injury and death in car accidents.

The research, published in the Journal of Safety Research, found that women are 73% more likely to be seriously injured in frontal crashes compared to men. Safety advocates are calling for regulatory changes to require testing with female-representative crash test dummies.
`;

async function testCascadeMCP() {
  try {
    console.log('Starting OpenAI integration test with simulated Firecrawl MCP data');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Format news using OpenAI
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
    
    // Now let's demonstrate how we would use this in a deep research workflow
    console.log('\n=== DEEP RESEARCH WORKFLOW ===\n');
    
    // Step 1: Define research question
    const researchQuestion = "What are the latest developments in autonomous vehicle technology and its impact on transportation?";
    console.log(`Research Question: ${researchQuestion}`);
    
    // Step 2: Use OpenAI to generate research plan
    const researchPlanResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a research planning assistant. Create a structured research plan for investigating the given topic."
        },
        {
          role: "user",
          content: `Create a research plan for investigating: ${researchQuestion}`
        }
      ]
    });
    
    const researchPlan = researchPlanResponse.choices[0].message.content;
    console.log('\nResearch Plan:');
    console.log(researchPlan);
    
    // Step 3: Demonstrate how we would use Firecrawl MCP for deep research
    console.log('\nIn a full implementation, we would now:');
    console.log('1. Use Firecrawl MCP deep_research tool to gather comprehensive information');
    console.log('2. Process and structure the research results with OpenAI');
    console.log('3. Generate insights and conclusions based on the structured data');
    console.log('4. Present the findings in a formatted report');
    
    console.log('\nTest completed successfully');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCascadeMCP().catch(console.error);
