# Firecrawl Deep Research MCP Guide
**Last Updated: June 24, 2025**

## Overview

Firecrawl's Deep Research is an AI-powered web research tool that autonomously explores the web, gathers relevant information, and synthesizes findings into comprehensive insights. This guide focuses on using Deep Research through the Model Context Protocol (MCP) interface.

> **Important Note:** The original `/deep-research` API endpoint is being deprecated in favor of the new Search API, but will remain active until June 30, 2025. For future development, consider using the Search API or the open-source [Firesearch project](https://github.com/mendableai/firesearch).

## Setting Up Firecrawl MCP

### Option 1: Use Remote Hosted URL (Recommended)

The simplest way to access Firecrawl's MCP capabilities is through their hosted service:

```
https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/sse
```

Replace `{FIRECRAWL_API_KEY}` with your API key from [firecrawl.dev/app/api-keys](https://www.firecrawl.dev/app/api-keys).

### Option 2: Run Locally with NPX

```bash
env FIRECRAWL_API_KEY=fc-YOUR_API_KEY npx -y firecrawl-mcp
```

### Option 3: Manual Installation

```bash
npm install -g firecrawl-mcp
```

Then run with your API key configured.

## Using Deep Research in Your Application

### MCP Tool Interface

The Deep Research tool is exposed through MCP as `firecrawl_deep_research`. Here's how to use it:

```json
{
  "name": "firecrawl_deep_research",
  "arguments": {
    "query": "Research question or topic",
    "maxDepth": 3,      // Optional: Max crawl/search depth (default: 3)
    "timeLimit": 120,   // Optional: Time limit in seconds (default: 120)
    "maxUrls": 50       // Optional: Max URLs to analyze (default: 50)
  }
}
```

### Checking Research Status

After initiating a deep research request, you'll receive a job ID. Use the `firecrawl_check_crawl_status` tool to check the status:

```json
{
  "name": "firecrawl_check_crawl_status",
  "arguments": {
    "id": "your-research-job-id"
  }
}
```

### Response Structure

The response from a completed deep research job includes:

- **finalAnalysis**: Comprehensive synthesis of key insights
- **activities**: Timeline of research steps and findings
- **sources**: List of relevant URLs with titles and descriptions
- **status**: Current status ("processing", "completed", "failed")
- **currentDepth**: Current research depth
- **maxDepth**: Maximum configured depth
- **totalUrls**: Number of URLs analyzed

## Implementation Examples

### Python Example with LangChain

```python
from langchain.agents import initialize_agent, AgentType
from langchain.llms import OpenAI
from langchain.tools import Tool
from langchain.utilities import MCP

# Initialize MCP client
mcp_client = MCP(
    server_url="https://mcp.firecrawl.dev/fc-YOUR_API_KEY/sse"
)

# Create tools using MCP
tools = [
    Tool(
        name="deep_research",
        func=lambda query: mcp_client.call_tool(
            "firecrawl_deep_research", 
            {"query": query, "maxDepth": 3, "timeLimit": 120, "maxUrls": 20}
        ),
        description="Conduct deep web research on a query using intelligent crawling and analysis"
    ),
    Tool(
        name="check_research_status",
        func=lambda id: mcp_client.call_tool(
            "firecrawl_check_crawl_status", 
            {"id": id}
        ),
        description="Check the status of a deep research job"
    )
]

# Initialize agent
llm = OpenAI(temperature=0)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)

# Run agent
result = agent.run("Research the latest advancements in quantum computing")
print(result)
```

### JavaScript Example

```javascript
import { OpenAI } from "openai";
import { MCPClient } from "mcp-client";

// Initialize MCP client
const mcpClient = new MCPClient({
  serverUrl: "https://mcp.firecrawl.dev/fc-YOUR_API_KEY/sse"
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function conductResearch(query) {
  // Start the research
  const researchResponse = await mcpClient.callTool("firecrawl_deep_research", {
    query,
    maxDepth: 3,
    timeLimit: 120,
    maxUrls: 20
  });
  
  const researchId = researchResponse.id;
  console.log(`Research started with ID: ${researchId}`);
  
  // Poll for results
  let completed = false;
  let result;
  
  while (!completed) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const statusResponse = await mcpClient.callTool("firecrawl_check_crawl_status", {
      id: researchId
    });
    
    console.log(`Research status: ${statusResponse.data.status}`);
    
    if (statusResponse.data.status === "completed") {
      completed = true;
      result = statusResponse.data;
    } else if (statusResponse.data.status === "failed") {
      throw new Error(`Research failed: ${statusResponse.data.error}`);
    }
  }
  
  return result;
}

// Use the research in an AI assistant
async function askAssistant(query) {
  try {
    const researchResult = await conductResearch(query);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that uses research to provide accurate information." },
        { role: "user", content: query },
        { role: "assistant", content: `I've researched this topic. Here's what I found:\n\n${researchResult.finalAnalysis}` }
      ]
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return "Sorry, I encountered an error while researching.";
  }
}

// Example usage
askAssistant("What are the environmental impacts of electric vehicles?")
  .then(response => console.log(response));
```

## Best Practices

1. **Set Appropriate Time Limits**: Balance between thoroughness and responsiveness.
2. **Limit URL Count**: Start with a lower `maxUrls` value (20-30) to reduce costs and processing time.
3. **Handle Asynchronous Processing**: Implement proper polling or webhook handling for status updates.
4. **Error Handling**: Always check for and handle potential errors in the research process.
5. **Source Attribution**: When presenting research results, include source attribution from the `sources` field.

## Billing and Usage

- Billing is based on the number of URLs analyzed
- Each URL counts as 1 credit
- You can control costs by setting the `maxUrls` parameter

## Alternative Options

Since the original Deep Research API is being deprecated (but still active until June 30, 2025), consider these alternatives for future development:

1. **Firecrawl Search API**: The recommended replacement for deep research capabilities
2. **Open-source Firesearch**: Build your own research system using the [Firesearch project](https://github.com/mendableai/firesearch)
3. **Custom Implementation**: Combine Firecrawl's other tools (search, scrape, extract) to create a tailored research workflow

## Resources

- [Firecrawl MCP Documentation](https://docs.firecrawl.dev/mcp)
- [Deep Research API Reference](https://docs.firecrawl.dev/api-reference/endpoint/deep-research)
- [Firesearch Project](https://github.com/mendableai/firesearch)
- [Firecrawl API Keys](https://www.firecrawl.dev/app/api-keys)
