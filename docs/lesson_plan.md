# Vibe Coding 11 MCP: Deep Research & Analysis with Firecrawl and OpenAI

## Course Overview
This course teaches students how to build a powerful research tool by combining Firecrawl's web scraping capabilities with OpenAI's structured data analysis. Students will learn to fetch content from the web and process it into structured, actionable insights using AI agents.

## Learning Objectives
- Understand Model Context Protocol (MCP) and its application in AI tools
- Set up and utilize Firecrawl for efficient web research
- Configure OpenAI function calling and structured outputs
- Build an end-to-end tool that scrapes web content and produces structured analyses
- Implement proper API security practices

## Prerequisites
- Basic JavaScript/Node.js knowledge
- Familiarity with APIs and async programming
- A modern code editor (VS Code recommended)
- Node.js installed (v16+ recommended)

## Resource Links
- [OpenAI Tools Guide](https://platform.openai.com/docs/guides/tools?api-mode=chat)
- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat)
- [Firecrawl Documentation](https://docs.firecrawl.dev/introduction)

## Detailed Lesson Plan

### Step 1: Project Setup (5 mins)
```bash
# Create a project folder
mkdir deep-research-tool
cd deep-research-tool

# Initialize package.json
npm init -y

# Install dependencies
npm install dotenv openai zod axios
```

**Key Teaching Points:**
- Importance of proper project structure
- Introduction to the libraries we're using
- Explaining the role of each dependency

### Step 2: Create Configuration Files (5 mins)

**Create `.env` file:**
```
FIRECRAWL_API_KEY=your_firecrawl_key_here
OPENAI_API_KEY=your_openai_key_here
```

**Create `.env.example` file:**
```
FIRECRAWL_API_KEY=
OPENAI_API_KEY=
```

**Key Teaching Points:**
- API security best practices
- Importance of .env.example for collaboration
- Environment variable management
- Warning about never committing API keys to GitHub (.gitignore setup)

### Step 3: Implement Web Scraping with Firecrawl (10 mins)

**Key Teaching Points:**
- Introduction to Firecrawl and MCP
- The `firecrawl_deep_research` endpoint
- Requesting content in markdown format
- Handling API responses
- Error handling for API calls

**Main Features to Cover:**
- Setting up the Firecrawl client
- Configuring research parameters
- Processing and storing the scraped content

### Step 4: Implement OpenAI Tool Definition (10 mins)

**Key Teaching Points:**
- Introduction to OpenAI function calling
- Creating tool schemas with Zod
- JSON response validation
- Configuring the OpenAI client properly
- Understanding tool/function parameters

**Main Features to Cover:**
- Setting up the OpenAI client
- Defining functions for structured extraction
- Creating a schema for research analyses
- Error handling for OpenAI API calls

### Step 5: Run the End-to-End Process (15 mins)

**Key Teaching Points:**
- Connecting the scraping and analysis steps
- Handling asynchronous operations
- Transforming data between APIs
- Presenting the final structured output
- Use cases for the research tool

**Main Features to Cover:**
- Running a full research query on a news article or website
- Showing the structured JSON output
- Explaining how the output could be used in applications
- Discussing how to extend the functionality

### Step 6: Advanced Extensions & Discussion (10 mins)

**Topics to Cover:**
- Adding rate limiting for API calls
- Implementing caching for repeated queries
- Creating a simple UI for the research tool
- Saving research results to a database
- Adding more structured extraction templates

## Hands-on Exercise
Students will select a research topic and use the tool to:
1. Gather information from multiple sources
2. Extract key points and insights
3. Generate a structured summary
4. Present findings to the class

## Homework Assignment
Extend the basic research tool with one of the following features:
- Expanded schema for more detailed extraction
- Multiple source comparison
- Web interface for easy querying
- Data visualization of research results
- Custom prompt engineering for specific research domains

---

# Class Email Template

**Subject:** Vibe Coding 11: Deep Research Tool with Firecrawl & OpenAI - Class Materials & Preparation

Dear Students,

I'm excited about our upcoming Vibe Coding 11 class where we'll build a powerful AI-powered research tool using Firecrawl MCP and OpenAI's structured outputs. This hands-on session will teach you how to combine web scraping with advanced AI processing to create tools that can analyze online content effectively.

## Class Preparation

To make the most of our session, please:

1. **Install the required software:**
   - Node.js (v16+ recommended)
   - A code editor (VS Code recommended)

2. **Create accounts (if you don't have them already):**
   - [OpenAI Platform](https://platform.openai.com/) - Sign up and generate an API key
   - [Firecrawl](https://docs.firecrawl.dev/) - Sign up for an account and get your API key

3. **Review the documentation links:**
   - [OpenAI Tools Guide](https://platform.openai.com/docs/guides/tools?api-mode=chat)
   - [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat)
   - [Firecrawl Documentation](https://docs.firecrawl.dev/introduction)

4. **Think about a research topic** you might want to explore with our tool. Good candidates include:
   - Comparing product features
   - Gathering information on a news event
   - Researching a specific domain or concept

## What We'll Build

During class, we'll create a command-line tool that:
1. Takes a research question as input
2. Uses Firecrawl to gather relevant web content
3. Processes that content with OpenAI's structured outputs
4. Returns organized, structured insights

This is a practical skill that can be applied to content marketing, competitive research, academic studies, and many other fields requiring information synthesis.

## After Class

The code and materials from the class will be available in our shared repository. You'll be able to:
- Review the complete solution
- Extend the tool with your own enhancements
- Use it as a starting point for your own projects

If you have any questions before class or need help with the preparation steps, please don't hesitate to reach out.

Looking forward to seeing you all!

Best regards,
[Instructor Name]
