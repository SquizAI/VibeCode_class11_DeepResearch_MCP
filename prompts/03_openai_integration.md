# OpenAI Function Calling Integration Prompt

## How to Use This Prompt
When implementing OpenAI integration, provide this prompt to your AI assistant along with details about your specific analysis needs. Mention the types of structured data you want to extract, any domain-specific requirements, and integration points with other components. Example: "I need to implement an OpenAI module that can extract research findings from technical articles and categorize them by technology type."


## Context
As of June 24, 2025, we're implementing the OpenAI component of our deep research tool that will handle structured data analysis of web content extracted by Firecrawl. We'll use the `chatgpt-4o-latest` model for primary analysis and structured outputs, with optional use of `gpt-4o-search-preview` for supplementary web search capabilities when needed.

## Prompt
Create a Node.js module that leverages OpenAI's function calling capabilities with these specifications:

1. Set up a client for OpenAI's latest API with appropriate authentication
2. Design tool definitions that extract structured data from research content
3. Implement proper request handling with the newer streaming paradigms
4. Add support for parallel function execution to improve performance
5. Create appropriate schema validation for the returned structured data

## Expected Output
- A robust OpenAI client with proper error handling
- Tool definitions for various research analysis tasks
- Functions to process unstructured text into structured data
- Comprehensive handling of API responses and error conditions
- Well-documented code with usage examples

## Vibe Coding Tips (June 2025)
- Use the new [`openai@^2.0.0` library](https://github.com/openai/openai-node) with its improved TypeScript support and streaming capabilities
- Implement the latest [token-efficient context management techniques](https://platform.openai.com/docs/guides/efficient-usage) to reduce API costs
- Use the enhanced [function calling format](https://platform.openai.com/docs/guides/function-calling) with multiple parallel function calls
- Take advantage of the new [schema generation features](https://platform.openai.com/docs/guides/structured-outputs) for more accurate structured outputs
- Implement the [token accounting system](https://platform.openai.com/docs/guides/tokens) to keep track of API usage and costs

## Additional Resources
- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Tools Guide](https://platform.openai.com/docs/guides/tools)
- [OpenAI Web Search Tools Guide](https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat)
