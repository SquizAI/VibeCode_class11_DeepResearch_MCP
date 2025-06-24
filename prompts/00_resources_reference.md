# Deep Research Tool Resources Reference

## OpenAI Models & Documentation

### Primary Model
- **GPT-4o (Latest)**: `chatgpt-4o-latest`
  - [Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
  - [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
  - [Tools Guide](https://platform.openai.com/docs/guides/tools)

### Search-Enabled Model
- **GPT-4o Search Preview**: `gpt-4o-search-preview`
  - [Web Search Tools Guide](https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat)

## Firecrawl Resources

### GitHub Repository
- [Firecrawl MCP Server](https://github.com/mendableai/firecrawl-mcp-server)

### SDK & Documentation
- [Node.js SDK Documentation](https://docs.firecrawl.dev/sdks/node)
- [Hosted Capabilities](https://docs.firecrawl.dev/mcp#7-deep-research-tool-firecrawl-deep-research)

## Integration Approach

For this project, we'll use:

1. **Firecrawl MCP** for deep research capabilities:
   - Web crawling and content extraction
   - Deep research with intelligent navigation
   - Content analysis across multiple sources

2. **OpenAI GPT-4o** for structured analysis:
   - Processing research findings
   - Extracting structured data
   - Generating comprehensive summaries

3. **Optional: GPT-4o Search Preview** for supplementary web search when needed

## Key Integration Points

- Firecrawl MCP will handle the heavy lifting of web research
- OpenAI will process and structure the findings
- The integration will provide a seamless research experience from query to structured insights
