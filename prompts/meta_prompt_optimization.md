# Meta Prompt for Application Optimization

## How to Use This Prompt
When seeking to optimize your deep research application, provide this meta prompt to your AI assistant with specific details about your current implementation and performance metrics. Fill in the template with your actual values and prioritize which aspects you want to optimize. Example: "I've implemented a deep research tool with Firecrawl and OpenAI, but I'm experiencing high token usage and slow response times. I'm looking for optimization strategies that prioritize cost and speed."


## Purpose
This meta prompt is designed to help developers optimize their Firecrawl MCP and OpenAI-powered deep research applications. Use this prompt template when working with AI assistants to refine and enhance your implementation.

## Meta Prompt Template

```
I'm building a deep research application using Firecrawl MCP (version [YOUR_VERSION]) and OpenAI (model [YOUR_MODEL]) with the following components:

[DESCRIBE YOUR CURRENT IMPLEMENTATION IN 3-5 SENTENCES]

My application currently achieves the following:
- Research depth: [SHALLOW/MODERATE/DEEP]  
- Average completion time: [TIME IN SECONDS/MINUTES]
- Token usage per query: [APPROXIMATE TOKEN COUNT]
- Success rate for queries: [PERCENTAGE]

I'm specifically looking to optimize for:
[CHOOSE ONE OR MORE: COST/SPEED/ACCURACY/DEPTH]

Please provide specific optimizations for:
1. API usage efficiency
2. Prompt engineering improvements
3. Data transformation between services
4. Caching and memoization strategies
5. Error handling and fallback mechanisms

Additionally, I'd like guidance on implementing the latest [SPECIFIC FEATURE] from the June 2025 updates to both platforms.
```

## Using This Meta Prompt Effectively

1. **Be Specific About Your Implementation**: The more detailed you are about your current architecture, the more targeted the optimization advice will be.

2. **Prioritize Your Optimization Goals**: Different optimizations have different trade-offs. Make it clear what you're prioritizing (cost, speed, depth, or accuracy).

3. **Provide Baseline Metrics**: Including your current performance metrics helps establish a baseline for improvements.

4. **Request Concrete Examples**: Ask for specific code snippets or configuration examples when possible.

5. **Follow Up With Results**: After implementing suggestions, report back on the results to get further refinements.

## Latest Optimization Techniques (June 2025)

When using this meta prompt, consider asking about these cutting-edge optimization techniques:

1. **[Dynamic Token Budget Allocation](https://platform.openai.com/docs/guides/token-usage-optimization)**: Adaptive adjustment of token usage based on query complexity
   
2. **[Parallel Research Orchestration](https://docs.firecrawl.dev/advanced/parallel-execution)**: Utilizing the new concurrent execution features in Firecrawl v1.12.0
   
3. **[Smart Caching With Predictive Invalidation](https://github.com/cache-strategies/predictive-cache)**: Leveraging usage patterns to determine optimal cache lifetimes
   
4. **[Progressive Research Depth](https://docs.firecrawl.dev/deep-research/progressive)**: Starting with shallow research and progressively deepening based on initial findings
   
5. **[Cross-Service Result Validation](https://github.com/ai-validation/cross-service-validator)**: Comparing outputs from multiple sources to improve accuracy
   
6. **[Hybrid RAG + Agent Patterns](https://platform.openai.com/docs/guides/retrieval-augmented-generation)**: Combining retrieval-augmented generation with agentic workflows

7. **[Adaptive Prompt Engineering](https://github.com/adaptive-prompting/prompt-evolution)**: Dynamically adjusting prompts based on prior query successes

8. **[Semantic Deduplication](https://github.com/semantic-tools/deduplication)**: Removing redundant information across multiple sources based on semantic similarity

## Additional Resources

- [Firecrawl MCP Performance Optimization Guide](https://docs.firecrawl.dev/optimization)
- [OpenAI API Usage Efficiency Best Practices](https://platform.openai.com/docs/guides/efficiency-best-practices)
- [AI Research Pipeline Architecture Patterns](https://github.com/ai-patterns/research-pipelines)
- [2025 AI Application Performance Benchmarks](https://ai-benchmarks.dev/2025)

Remember that optimization is an iterative process. Use this meta prompt as a starting point for an ongoing optimization conversation with AI assistants.
