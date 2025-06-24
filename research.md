# Firecrawl Research: Web Scraping and Data Extraction Capabilities

## Overview of Firecrawl

Firecrawl is an API service that takes URLs, crawls them, and converts web content into clean markdown or structured data formats. It's designed to handle the complexities of web scraping including proxies, caching, rate limits, JavaScript-rendered content, and more.

## Key Features

### 1. Scraping (`/scrape` endpoint)

Firecrawl converts web pages into markdown, ideal for LLM applications:

- **Handles Complexities**: Manages proxies, caching, rate limits, and JavaScript-blocked content
- **Dynamic Content Support**: Processes dynamic websites, JavaScript-rendered sites, PDFs, and images
- **Multiple Output Formats**: Provides clean markdown, structured data, screenshots, or HTML
- **Pre-scrape Actions**: Allows interactions with the page (clicking, scrolling, etc.) before scraping

#### Usage Example (Python):
```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Scrape a website:
scrape_result = app.scrape_url('firecrawl.dev', formats=['markdown', 'html'])
print(scrape_result)
```

### 2. Crawling (`/crawl` endpoint)

Efficiently crawls websites to extract comprehensive data:

- **URL Analysis**: Scans sitemap and crawls website to identify links
- **Traversal**: Recursively follows links to find all subpages
- **Scraping**: Extracts content from each page, handling JavaScript and rate limits
- **Asynchronous Processing**: Submits a crawl job and returns a job ID to check status

#### Usage Example (Python):
```python
from firecrawl import FirecrawlApp, ScrapeOptions

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Crawl a website:
crawl_result = app.crawl_url(
  'https://firecrawl.dev',
  limit=100,  # Maximum number of pages to crawl
  max_depth=3  # Maximum depth of links to follow
)

# Check crawl status
job_id = crawl_result['id']
status = app.check_crawl_status(job_id)
```

### 3. Deep Research (Alpha)

The `/deep-research` endpoint enables AI-powered deep research and analysis on any topic:

- **Autonomous Exploration**: Analyzes queries to identify key research areas
- **Iterative Search**: Explores relevant web content through multiple iterations
- **Information Synthesis**: Combines information from multiple sources
- **Structured Output**: Provides activities, sources, and final analysis

> Note: This feature is being deprecated in favor of the Search API, but will remain active until June 30, 2025.

#### Usage Example (Python):
```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Start deep research
research = app.deep_research(
  query="What are the environmental impacts of electric vehicles?",
  max_depth=3,
  time_limit=120,
  max_urls=30
)

# Check research status
research_id = research['id']
status = app.check_deep_research_status(research_id)
```

### 4. Search (`/search` endpoint)

Performs web searches and optionally extracts content from search results:

- **Targeted Information**: Finds specific information across multiple websites
- **Relevance Ranking**: Returns the most relevant content for a query
- **Content Extraction**: Optionally scrapes content from search results
- **Customization**: Supports filters, language settings, and location parameters

### 5. Extract (`/extract` endpoint)

Extracts structured information from web pages using LLM capabilities:

- **Structured Data**: Extracts specific data like prices, names, details
- **Schema-based**: Uses JSON schema for structured data extraction
- **LLM-powered**: Leverages AI to understand and extract relevant information

## Integration Capabilities

Firecrawl integrates with popular LLM frameworks and tools:

- **SDKs**: Python, Node, Go, Rust
- **LLM Frameworks**: Langchain (Python/JS), LlamaIndex, Crew.ai, Composio
- **API Access**: RESTful API with comprehensive documentation

## Deployment Options

- **Cloud Service**: Hosted API service with usage-based billing
- **Self-hosted**: Open-source version available for self-hosting

## Use Cases

- Building RAG (Retrieval-Augmented Generation) systems
- Training LLMs with web data
- Creating knowledge bases from websites
- Monitoring website changes
- Extracting structured data from web pages
- Performing deep research on specific topics

## Billing and Usage

- Billing is typically based on the number of URLs processed
- Each URL counts as 1 credit
- Parameters like `maxUrls` can limit usage

## Additional Features

- **Webhooks**: Real-time notifications for crawl events
- **Batch Scraping**: Process multiple URLs efficiently
- **Change Tracking**: Monitor website changes over time
- **LLMs.txt Generation**: Create standardized permission guidelines for AI models

## Resources

- [Documentation](https://docs.firecrawl.dev/api-reference/introduction)
- [SDKs](https://docs.firecrawl.dev/sdks/overview)
- [API Reference](https://docs.firecrawl.dev/api-reference/introduction)
