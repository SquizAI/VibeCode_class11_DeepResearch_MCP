# Command Line Interface Prompt

## How to Use This Prompt
When implementing the command-line interface, provide this prompt to your AI assistant with details about your expected user interactions and output requirements. Describe the commands your tool should support, expected inputs and outputs, and any special formatting or display requirements. Example: "I need to create a CLI for my deep research tool that accepts research queries, displays progress while gathering data, and outputs results as formatted markdown."


## Context
As of June 24, 2025, we're implementing a CLI for our deep research tool to provide an intuitive interface for users to interact with Firecrawl MCP and OpenAI analysis capabilities.

## Prompt
Create a modern command-line interface for our deep research tool with these specifications:

1. Design an intuitive CLI using a modern framework like Commander.js or Yargs
2. Implement appropriate user input validation and formatting
3. Create rich, interactive output displays for research results
4. Add progress indicators for long-running research operations
5. Implement config management for API keys and user preferences

## Expected Output
- A fully functional CLI with proper command structure and help documentation
- Input validation with descriptive error messages
- Visually appealing output for research results with proper formatting
- Interactive progress displays for ongoing research tasks
- Configuration management with secure credential handling

## Vibe Coding Tips (June 2025)
- Use the new [`cli-forge`](https://github.com/cli-forge/cli-forge) framework for modern, responsive terminal interfaces
- Implement adaptive loading animations with the latest [`ora@7.0.0`](https://github.com/sindresorhus/ora) spinners
- Consider adding the new terminal markdown rendering with [`term-md@2.0.0`](https://github.com/term-tools/term-md) for rich output
- Use the latest [`conf-vault@3.0.0`](https://github.com/secure-config/conf-vault) for secure API key management
- Add support for the new [command completion architecture](https://cli.dev/guides/command-completion) in modern shells

## Additional Resources
- [Modern CLI Development Guide](https://cli.dev/guides/modern-cli)
- [Terminal UI Best Practices](https://clig.dev/) (Command Line Interface Guidelines)
- [Interactive CLI Components](https://github.com/vadimdemedes/ink)
- [CLI Security Patterns](https://cli.dev/guides/security-patterns)
