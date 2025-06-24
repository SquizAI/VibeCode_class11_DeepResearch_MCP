# Firecrawl Deep Research Tool Prompt

## How to Use This Prompt
When using the Firecrawl deep research tool, provide this prompt to your AI assistant along with your specific research query. Specify any parameters you want to adjust such as maximum depth, time limit, or URL count. Example: "I need to research the latest developments in quantum computing, focusing on practical applications in the last 2 years."

## Context
As of June 24, 2025, we're using the Firecrawl MCP deep research tool to gather comprehensive information from the web on specific topics. This tool performs intelligent crawling, search, and analysis using the [Firecrawl MCP server](https://github.com/mendableai/firecrawl-mcp-server).

## Prompt
Conduct deep web research on the following topic using the Firecrawl MCP deep research tool:

```json
{
  "name": "firecrawl_deep_research",
  "arguments": {
    "query": "[YOUR_RESEARCH_QUERY]",
    "maxDepth": 3,
    "timeLimit": 120,
    "maxUrls": 20
  }
}
```

Please analyze the results to provide:
1. A comprehensive summary of the key findings
2. Major perspectives or viewpoints on the topic
3. Any controversies or debates in the field
4. Recent developments or breakthroughs
5. Practical applications or implications

## Expected Output
- A detailed analysis based on multiple high-quality sources
- Properly cited information with source URLs
- Structured presentation of findings
- Identification of knowledge gaps or areas needing further research

## Implementation Details
This prompt uses the Firecrawl deep research tool which is available through the MCP server. The tool performs:
- Intelligent crawling of relevant websites
- Search functionality to discover related content
- LLM analysis to synthesize findings
- Multi-step research with progressive refinement

## Additional Resources
- [Firecrawl Node.js SDK Documentation](https://docs.firecrawl.dev/sdks/node)
- [Firecrawl Deep Research Tool](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research)
- [Firecrawl MCP Server GitHub Repository](https://github.com/mendableai/firecrawl-mcp-server)
