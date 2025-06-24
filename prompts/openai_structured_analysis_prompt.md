# OpenAI Structured Analysis Prompt

## How to Use This Prompt
When using OpenAI for structured analysis of research data, provide this prompt to your AI assistant along with the research content you want to analyze. Specify the type of structured output you need and any specific fields or categories for extraction. Example: "I have research data on renewable energy technologies and need to extract key innovations, implementation costs, and efficiency metrics."

## Context
As of June 24, 2025, we're using OpenAI's `chatgpt-4o-latest` model to analyze and structure research data gathered by Firecrawl. This approach leverages function calling and structured outputs to transform unstructured research content into organized, actionable insights.

## Prompt
Analyze the following research data and extract structured information using OpenAI's function calling capabilities:

```json
{
  "model": "chatgpt-4o-latest",
  "messages": [
    {
      "role": "system",
      "content": "You are a research analyst that extracts structured information from research data. Analyze the content thoroughly and extract the requested information."
    },
    {
      "role": "user",
      "content": "Research data: [PASTE_RESEARCH_DATA_HERE]\n\nPlease extract structured information according to the schema."
    }
  ],
  "functions": [
    {
      "name": "extract_research_insights",
      "description": "Extract structured insights from research data",
      "parameters": {
        "type": "object",
        "properties": {
          "key_findings": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "The main findings or insights from the research"
          },
          "topics": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "The main topics covered in the research"
          },
          "sources": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "The title of the source"
                },
                "url": {
                  "type": "string",
                  "description": "The URL of the source"
                },
                "key_points": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "Key points from this specific source"
                }
              }
            },
            "description": "The sources referenced in the research"
          },
          "summary": {
            "type": "string",
            "description": "A concise summary of the overall research findings"
          }
        },
        "required": ["key_findings", "topics", "summary"]
      }
    }
  ],
  "function_call": {"name": "extract_research_insights"}
}
```

## Expected Output
- Structured JSON data following the schema defined in the function
- Clear categorization of research findings
- Properly attributed sources
- Concise summary of overall insights

## Implementation Details
This prompt uses OpenAI's function calling capabilities to:
- Process unstructured research data
- Extract specific information according to a predefined schema
- Return the data in a consistent, structured format
- Enable programmatic use of the extracted information

## Additional Resources
- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Tools Guide](https://platform.openai.com/docs/guides/tools)
