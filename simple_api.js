// Simple API for Deep Research with Firecrawl and OpenAI
// This file creates a minimal Express server with endpoints that can be called via curl

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to perform deep research using Firecrawl
app.post('/research', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Starting deep research on: ${query}`);
    
    // Call Firecrawl for deep research
    const firecrawlResult = await axios.post(
      'https://api.firecrawl.dev/deep_research',
      {
        query,
        maxDepth: 3,
        timeLimit: 120,
        maxUrls: 20
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Deep research completed, analyzing with OpenAI...');
    
    // Process with OpenAI
    const openaiResult = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a research analyst. Analyze the following research data and provide a concise summary with key findings."
        },
        {
          role: "user",
          content: `Research question: ${query}\n\nResearch data:\n${JSON.stringify(firecrawlResult.data.finalAnalysis)}`
        }
      ],
      max_tokens: 1000
    });

    // Return both raw research data and the analysis
    return res.json({
      research: firecrawlResult.data,
      analysis: openaiResult.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.response?.data || error);
    return res.status(500).json({ 
      error: 'Research failed', 
      details: error.message,
      response: error.response?.data 
    });
  }
});

// Structured data extraction endpoint
app.post('/extract', async (req, res) => {
  try {
    const { query, schema } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Call OpenAI with function calling to get structured data
    const result = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Extract structured information from the user's query."
        },
        {
          role: "user",
          content: query
        }
      ],
      functions: [
        {
          name: "extract_information",
          description: "Extract structured information from text",
          parameters: schema || {
            type: "object",
            properties: {
              topics: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Main topics identified in the text"
              },
              keyFindings: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Key findings or insights from the text"
              },
              summary: {
                type: "string",
                description: "Brief summary of the text"
              }
            },
            required: ["topics", "keyFindings", "summary"]
          }
        }
      ],
      function_call: { name: "extract_information" }
    });

    const functionCall = result.choices[0].message.function_call;
    const extractedData = JSON.parse(functionCall.arguments);
    
    return res.json({ 
      extracted: extractedData 
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Extraction failed', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}/research -H "Content-Type: application/json" -d '{"query":"your research query"}'`);
});
