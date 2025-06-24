# End-to-End Integration Workflow Prompt

## How to Use This Prompt
When implementing the end-to-end integration workflow, provide this prompt to your AI assistant along with specific details about your application architecture. Describe how data should flow between components, expected response times, and any specific requirements for caching or error handling. Example: "I need to create a workflow that connects my Firecrawl research module with my OpenAI analysis module, with an emphasis on fault tolerance and caching frequent queries."


## Context
As of June 24, 2025, we're implementing the workflow that connects Firecrawl MCP's web research capabilities with OpenAI's structured data analysis to create a cohesive deep research tool. We'll integrate the [Firecrawl Node.js SDK](https://docs.firecrawl.dev/sdks/node) with OpenAI's `chatgpt-4o-latest` model for primary analysis, using the [deep research tool](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research) capabilities.

## Prompt
Create an end-to-end workflow that integrates Firecrawl and OpenAI components with these specifications:

1. Design a main orchestrator that manages the complete research workflow
2. Implement proper data transformation between Firecrawl research results and OpenAI inputs
3. Create appropriate caching mechanisms to avoid redundant API calls
4. Add comprehensive logging and error recovery for multi-step processes
5. Implement request throttling and concurrency management across both APIs

## Expected Output
- A robust main application that orchestrates the research process from query to final analysis
- Effective data pipeline between Firecrawl content extraction and OpenAI analysis
- Smart caching system that optimizes API usage and improves performance
- Well-structured error handling with graceful fallbacks at each step
- Performance monitoring and usage statistics for API calls

## Vibe Coding Tips (June 2025)
- Use the new [Agentica Framework](https://github.com/wrtnlabs/agentica) for structured workflow orchestration between services
- Implement [multi-step research](https://docs.firecrawl.dev/deep-research/multi-step) with progressive refinement using the latest agent patterns
- Consider implementing [Retrieval Augmented Generation (RAG)](https://platform.openai.com/docs/guides/retrieval) to enhance analysis quality
- Leverage the new [stateful research session management](https://docs.firecrawl.dev/sessions/management) in both APIs
- Use the latest [MCP orchestration patterns](https://docs.mcp-protocol.org/orchestration) for more efficient multi-service coordination

## Additional Resources
- [Firecrawl Node.js SDK Documentation](https://docs.firecrawl.dev/sdks/node)
- [Firecrawl Deep Research Tool](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research)
- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Tools Guide](https://platform.openai.com/docs/guides/tools)
- [Firecrawl MCP Server GitHub Repository](https://github.com/mendableai/firecrawl-mcp-server)
