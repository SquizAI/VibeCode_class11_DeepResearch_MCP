# Project Setup Prompt

## How to Use This Prompt
When setting up a new project, provide this prompt to your AI assistant along with any specific requirements for your deep research tool. Mention your preferred tech stack, coding standards, and any existing infrastructure the project needs to integrate with. Example: "I need to set up a new project for a deep research tool using TypeScript and want to follow current best practices for API security."


## Context
As of June 24, 2025, we're building a deep research tool that leverages the Firecrawl MCP for web scraping and OpenAI's function calling for structured analysis.

## Prompt
Set up a modern JavaScript project with the following specifications:

1. Initialize a Node.js project with ESM support
2. Configure the project with the latest security best practices for API key management
3. Install the necessary dependencies for working with Firecrawl MCP and OpenAI APIs
4. Set up proper TypeScript configuration to leverage type safety throughout the project
5. Implement appropriate error handling patterns for API interactions

## Expected Output
- A fully configured project structure ready for implementing our deep research tool
- Environment variable setup with proper security considerations
- A well-structured README.md with setup instructions
- Properly configured tsconfig.json for TypeScript support
- Basic dev tooling (ESLint, Prettier) with the 2025 recommended configurations

## Vibe Coding Tips (June 2025)
- Use [`npm init @modern/app`](https://npmjs.com/package/@modern/app) to quickly scaffold a project with current best practices
- Implement API key rotation with the latest [`dotenv-rotate`](https://npmjs.com/package/dotenv-rotate) package for enhanced security
- Configure package.json with the "type": "module" field to utilize ES modules by default
- Use the new crypto-vault pattern for sensitive credentials [`@vaults/credentials`](https://npmjs.com/package/@vaults/credentials)
- Consider implementing the new [OpenAI streaming response handlers](https://platform.openai.com/docs/api-reference/streaming) for more efficient token usage

## Additional Resources
- [Modern JavaScript Project Setup Guide (2025)](https://nodejs.dev/learn/modern-js-setup-2025)
- [API Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/API_Security_Cheat_Sheet.html)
- [TypeScript Configuration for AI Projects](https://www.typescriptlang.org/docs/handbook/ai-integrations.html)
