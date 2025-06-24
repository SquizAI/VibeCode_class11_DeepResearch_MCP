# Firecrawl MCP Integration Prompt

## How to Use This Prompt
When implementing Firecrawl integration, provide this prompt to your AI assistant with specific details about your research requirements. Mention what types of web content you'll be researching, any specialized data extraction needs, and performance requirements. Example: "I need to implement Firecrawl MCP integration for my project that will research technical documentation across multiple domains and extract code examples."


## Context
As of June 24, 2025, we're implementing the Firecrawl MCP component of our deep research tool, which will handle web scraping and content extraction. We'll use the official [Firecrawl Node.js SDK](https://docs.firecrawl.dev/sdks/node) and leverage the [deep research capabilities](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research) from the [Firecrawl MCP server](https://github.com/mendableai/firecrawl-mcp-server).

## Prompt
Implement a Node.js module that integrates with Firecrawl MCP for deep web research with these specifications:

1. Create a client for Firecrawl's deep research API endpoint
2. Implement the deep research workflow to gather information from multiple sources
3. Configure appropriate rate limiting and error handling for API calls
4. Add support for the latest Firecrawl v1.12.0 parallel function execution
5. Implement proper response parsing and data extraction

## Expected Output
- A fully functional Firecrawl MCP client module
- Functions for initiating deep research, tracking progress, and retrieving results
- Proper error handling for API rate limits and failed requests
- Support for concurrent research workflows with the new parallel execution features
- Comprehensive documentation for all implemented functions

## Vibe Coding Tips (June 2025)
- Utilize [Firecrawl's MCP standardized registration system](https://docs.firecrawl.dev/mcp/registration) for more reliable tool integration
- Implement the latest [deep research extraction patterns](https://docs.firecrawl.dev/deep-research/extraction) with multi-step search refinement
- Configure parallel crawls with the new [concurrency control features](https://docs.firecrawl.dev/advanced/parallel-execution) added in v1.12.0
- Use the enhanced [error validation system](https://docs.firecrawl.dev/error-handling) for more robust error handling
- Leverage the new [streaming response handlers](https://docs.firecrawl.dev/responses/streaming) to process partial results while research is ongoing

## Additional Resources
- [Firecrawl Node.js SDK Documentation](https://docs.firecrawl.dev/sdks/node)
- [Firecrawl Deep Research Tool](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research)
- [Firecrawl MCP Server GitHub Repository](https://github.com/mendableai/firecrawl-mcp-server)
- [Firecrawl MCP Documentation](https://docs.firecrawl.dev/mcp)
