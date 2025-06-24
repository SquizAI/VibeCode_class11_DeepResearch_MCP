# End-to-End Research Workflow Prompt

## How to Use This Prompt
When implementing a complete research workflow, provide this prompt to your AI assistant with your specific research query and any customization needs. Example: "I need to research emerging cybersecurity threats in cloud computing and generate a structured analysis with categorized vulnerabilities and mitigation strategies."

## Context
As of June 24, 2025, we're implementing an end-to-end research workflow that combines Firecrawl's deep research capabilities with OpenAI's structured analysis. This workflow uses the [Firecrawl Node.js SDK](https://docs.firecrawl.dev/sdks/node) and OpenAI's `chatgpt-4o-latest` model to transform a research query into structured, actionable insights.

## Prompt
Create an end-to-end research workflow that:

1. Takes a research query as input
2. Uses Firecrawl's deep research tool to gather comprehensive information
3. Processes the research data with OpenAI's function calling to extract structured insights
4. Returns the structured analysis in a consistent format

### Step 1: Firecrawl Deep Research
```javascript
// Using the Firecrawl Node.js SDK
const firecrawl = require('firecrawl');

async function conductDeepResearch(query) {
  const researchResult = await firecrawl.deepResearch({
    query: query,
    maxDepth: 3,
    timeLimit: 120,
    maxUrls: 20
  });
  
  return researchResult;
}
```

### Step 2: OpenAI Structured Analysis
```javascript
// Using OpenAI for structured analysis
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extractStructuredInsights(researchData) {
  const response = await openai.chat.completions.create({
    model: "chatgpt-4o-latest",
    messages: [
      {
        role: "system",
        content: "You are a research analyst that extracts structured information from research data."
      },
      {
        role: "user",
        content: `Research data: ${JSON.stringify(researchData)}\n\nPlease extract structured information according to the schema.`
      }
    ],
    functions: [
      {
        name: "extract_research_insights",
        description: "Extract structured insights from research data",
        parameters: {
          type: "object",
          properties: {
            key_findings: {
              type: "array",
              items: { type: "string" },
              description: "The main findings or insights from the research"
            },
            topics: {
              type: "array",
              items: { type: "string" },
              description: "The main topics covered in the research"
            },
            sources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  key_points: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            summary: { type: "string" }
          },
          required: ["key_findings", "topics", "summary"]
        }
      }
    ],
    function_call: { name: "extract_research_insights" }
  });
  
  return JSON.parse(response.choices[0].message.function_call.arguments);
}
```

### Step 3: Complete Workflow Integration
```javascript
async function researchWorkflow(query) {
  // Step 1: Conduct deep research
  const researchData = await conductDeepResearch(query);
  
  // Step 2: Extract structured insights
  const structuredInsights = await extractStructuredInsights(researchData);
  
  // Step 3: Return the complete research package
  return {
    query: query,
    raw_research: researchData,
    structured_analysis: structuredInsights,
    timestamp: new Date().toISOString()
  };
}
```

## Expected Output
- A complete research package containing:
  - The original query
  - Raw research data from Firecrawl
  - Structured analysis from OpenAI
  - Timestamp of the research

## Implementation Notes
- Use environment variables for API keys
- Implement proper error handling for both services
- Consider adding caching for frequent queries
- Add rate limiting to respect API usage limits

## Additional Resources
- [Firecrawl Node.js SDK Documentation](https://docs.firecrawl.dev/sdks/node)
- [Firecrawl Deep Research Tool](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research)
- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Tools Guide](https://platform.openai.com/docs/guides/tools)
- [Firecrawl MCP Server GitHub Repository](https://github.com/mendableai/firecrawl-mcp-server)
