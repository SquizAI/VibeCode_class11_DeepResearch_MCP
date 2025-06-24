#!/bin/bash

# Test script for fetching latest news using Firecrawl MCP and OpenAI

echo "=== Testing News API with curl ==="
echo "1. Fetching latest news from Firecrawl MCP..."

# Step 1: Fetch news from Firecrawl MCP
NEWS_RESPONSE=$(curl -s -X POST "https://firecrawl-mcp.windsurf.io/v1/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest breaking news today",
    "limit": 3,
    "scrapeOptions": {
      "formats": ["markdown"],
      "onlyMainContent": true
    }
  }')

# Check if the response contains results
if [[ $NEWS_RESPONSE == *"results"* ]]; then
  echo "✅ Successfully fetched news from Firecrawl MCP"
  
  # Extract and save the content to a temporary file
  echo "$NEWS_RESPONSE" > temp_news.json
  echo "News content saved to temp_news.json"
  
  # Extract a sample of the content for display
  SAMPLE=$(echo "$NEWS_RESPONSE" | grep -o '"title":"[^"]*"' | head -3)
  echo "Sample headlines:"
  echo "$SAMPLE"
  
  # Step 2: Format with OpenAI
  echo -e "\n2. Formatting news with OpenAI..."
  
  # Load OpenAI API key from .env file if it exists
  if [ -f .env ]; then
    source .env
    echo "Loaded API key from .env file"
  else
    echo "⚠️ No .env file found. Please provide your OpenAI API key:"
    read -s OPENAI_API_KEY
  fi
  
  # Check if we have an API key
  if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ No OpenAI API key provided. Exiting."
    exit 1
  fi
  
  # Extract content from the news response for OpenAI processing
  NEWS_CONTENT=$(echo "$NEWS_RESPONSE" | grep -o '"content":"[^"]*"' | sed 's/"content":"//g' | sed 's/"//g' | head -3)
  
  # Create the OpenAI request payload
  OPENAI_REQUEST='{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a news summarization assistant. Extract and format the key news stories from the provided content."
      },
      {
        "role": "user",
        "content": "Here is the latest news content. Please format it into a simple structure with headlines, brief summaries, categories, and sources:\n\n'"$NEWS_CONTENT"'"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "format_latest_news",
          "description": "Format the latest news into a simple structure",
          "parameters": {
            "type": "object",
            "properties": {
              "headlines": {
                "type": "array",
                "description": "Top news headlines",
                "items": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "description": "Headline title"
                    },
                    "summary": {
                      "type": "string",
                      "description": "Brief summary of the news (1-2 sentences)"
                    },
                    "category": {
                      "type": "string",
                      "description": "News category (e.g., politics, technology, health)"
                    },
                    "source": {
                      "type": "string",
                      "description": "Source of the news"
                    }
                  },
                  "required": ["title", "summary", "category"]
                }
              },
              "timestamp": {
                "type": "string",
                "description": "Timestamp of when the news was collected"
              }
            },
            "required": ["headlines", "timestamp"]
          }
        }
      }
    ],
    "tool_choice": {
      "type": "function",
      "function": {
        "name": "format_latest_news"
      }
    }
  }'
  
  # Make the OpenAI API call
  OPENAI_RESPONSE=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "$OPENAI_REQUEST")
  
  # Save the OpenAI response
  echo "$OPENAI_RESPONSE" > temp_formatted_news.json
  echo "✅ OpenAI response saved to temp_formatted_news.json"
  
  # Extract and display the formatted news
  echo -e "\n=== FORMATTED NEWS ===\n"
  
  # Check if the response contains tool calls
  if [[ $OPENAI_RESPONSE == *"tool_calls"* ]]; then
    # Extract the function arguments
    FUNCTION_ARGS=$(echo "$OPENAI_RESPONSE" | grep -o '"arguments":"[^"]*"' | sed 's/"arguments":"//g' | sed 's/"//g')
    
    # Display the formatted news
    echo "$FUNCTION_ARGS" | sed 's/\\n/\n/g' | sed 's/\\"/"/g'
  else
    echo "❌ No formatted news found in the OpenAI response"
    echo "Raw response:"
    echo "$OPENAI_RESPONSE"
  fi
  
else
  echo "❌ Failed to fetch news from Firecrawl MCP"
  echo "Response:"
  echo "$NEWS_RESPONSE"
fi

# Clean up
echo -e "\nDone. Temporary files created: temp_news.json, temp_formatted_news.json"
