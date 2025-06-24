import { z } from 'zod';
import { ToolFunction } from './types.js';

/**
 * Specialized tool definitions for research data extraction
 * 
 * These tools are designed to extract structured data from research content
 * using OpenAI's function calling capabilities.
 */

/**
 * Tool for extracting key insights from research content
 */
export const researchInsightsExtractor: ToolFunction = {
  name: 'extract_research_insights',
  description: 'Extract key insights, findings, and conclusions from research content',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'A concise title summarizing the research topic'
      },
      summary: {
        type: 'string',
        description: 'A comprehensive summary of the research findings (250-500 words)'
      },
      keyInsights: {
        type: 'array',
        description: 'The most important insights from the research',
        items: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The topic or subject of the insight'
            },
            insight: {
              type: 'string',
              description: 'The key insight or finding'
            },
            confidence: {
              type: 'number',
              description: 'Confidence score from 0.0 to 1.0 based on source reliability and consensus',
              minimum: 0,
              maximum: 1
            },
            sources: {
              type: 'array',
              description: 'Source references supporting this insight',
              items: {
                type: 'string'
              }
            }
          },
          required: ['topic', 'insight', 'confidence']
        }
      },
      controversies: {
        type: 'array',
        description: 'Areas of debate or conflicting information in the research',
        items: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The topic of controversy'
            },
            perspectives: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  viewpoint: {
                    type: 'string',
                    description: 'A specific perspective or viewpoint'
                  },
                  supportingEvidence: {
                    type: 'string',
                    description: 'Evidence supporting this viewpoint'
                  }
                },
                required: ['viewpoint', 'supportingEvidence']
              }
            }
          },
          required: ['topic', 'perspectives']
        }
      },
      metadata: {
        type: 'object',
        properties: {
          topDomains: {
            type: 'array',
            description: 'Most frequently cited domains in the research',
            items: {
              type: 'string'
            }
          },
          researchTimeframe: {
            type: 'string',
            description: 'The timeframe covered by the research (e.g., "2020-2023")'
          },
          queryTime: {
            type: 'number',
            description: 'Time in seconds taken to perform the research'
          }
        }
      }
    },
    required: ['title', 'summary', 'keyInsights']
  }
};

/**
 * Validation schema for research insights
 */
export const researchInsightsSchema = z.object({
  title: z.string(),
  summary: z.string().min(100),
  keyInsights: z.array(
    z.object({
      topic: z.string(),
      insight: z.string(),
      confidence: z.number().min(0).max(1),
      sources: z.array(z.string()).optional()
    })
  ).min(1),
  controversies: z.array(
    z.object({
      topic: z.string(),
      perspectives: z.array(
        z.object({
          viewpoint: z.string(),
          supportingEvidence: z.string()
        })
      ).min(2)
    })
  ).optional(),
  metadata: z.object({
    topDomains: z.array(z.string()).optional(),
    researchTimeframe: z.string().optional(),
    queryTime: z.number().optional()
  }).optional()
});

/**
 * Tool for extracting source evaluation and credibility assessment
 */
export const sourceEvaluationExtractor: ToolFunction = {
  name: 'evaluate_sources',
  description: 'Evaluate the credibility and relevance of research sources',
  parameters: {
    type: 'object',
    properties: {
      sources: {
        type: 'array',
        description: 'Evaluation of individual sources',
        items: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL of the source'
            },
            title: {
              type: 'string',
              description: 'The title of the source'
            },
            author: {
              type: 'string',
              description: 'The author or organization behind the source'
            },
            credibilityScore: {
              type: 'number',
              description: 'Credibility score from 0.0 to 1.0',
              minimum: 0,
              maximum: 1
            },
            relevanceScore: {
              type: 'number',
              description: 'Relevance score from 0.0 to 1.0 for the research query',
              minimum: 0,
              maximum: 1
            },
            publicationDate: {
              type: 'string',
              description: 'Publication date if available'
            },
            biasAssessment: {
              type: 'string',
              description: 'Assessment of potential bias in the source',
              enum: ['minimal', 'moderate', 'significant', 'unknown']
            },
            key: {
              type: 'boolean',
              description: 'Whether this is a key source for the research'
            }
          },
          required: ['url', 'credibilityScore', 'relevanceScore']
        }
      },
      overallAssessment: {
        type: 'string',
        description: 'Overall assessment of the source quality and diversity'
      },
      sourceDiversity: {
        type: 'object',
        properties: {
          domainDiversity: {
            type: 'number',
            description: 'Score from 0.0 to 1.0 representing the diversity of domains',
            minimum: 0,
            maximum: 1
          },
          perspectiveDiversity: {
            type: 'number',
            description: 'Score from 0.0 to 1.0 representing the diversity of perspectives',
            minimum: 0,
            maximum: 1
          },
          recencyDistribution: {
            type: 'object',
            description: 'Distribution of sources by recency',
            properties: {
              last6Months: {
                type: 'number',
                description: 'Percentage of sources from the last 6 months'
              },
              last2Years: {
                type: 'number',
                description: 'Percentage of sources from the last 2 years'
              },
              older: {
                type: 'number',
                description: 'Percentage of sources older than 2 years'
              }
            }
          }
        }
      }
    },
    required: ['sources', 'overallAssessment']
  }
};

/**
 * Validation schema for source evaluation
 */
export const sourceEvaluationSchema = z.object({
  sources: z.array(
    z.object({
      url: z.string().url(),
      title: z.string().optional(),
      author: z.string().optional(),
      credibilityScore: z.number().min(0).max(1),
      relevanceScore: z.number().min(0).max(1),
      publicationDate: z.string().optional(),
      biasAssessment: z.enum(['minimal', 'moderate', 'significant', 'unknown']).optional(),
      key: z.boolean().optional()
    })
  ).min(1),
  overallAssessment: z.string(),
  sourceDiversity: z.object({
    domainDiversity: z.number().min(0).max(1).optional(),
    perspectiveDiversity: z.number().min(0).max(1).optional(),
    recencyDistribution: z.object({
      last6Months: z.number().min(0).max(100).optional(),
      last2Years: z.number().min(0).max(100).optional(),
      older: z.number().min(0).max(100).optional()
    }).optional()
  }).optional()
});

/**
 * Tool for extracting structured data from research for specific domains
 */
export const domainSpecificExtractor: ToolFunction = {
  name: 'extract_domain_specific_data',
  description: 'Extract structured data specific to a research domain',
  parameters: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description: 'The domain of the research',
        enum: [
          'technology',
          'science',
          'health',
          'environment',
          'business',
          'politics',
          'education',
          'other'
        ]
      },
      domainSpecificData: {
        type: 'object',
        description: 'Domain-specific structured data',
        additionalProperties: true
      },
      statistics: {
        type: 'array',
        description: 'Key statistics and figures from the research',
        items: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              description: 'The name of the metric or statistic'
            },
            value: {
              type: 'string',
              description: 'The value of the metric (as a string to support various formats)'
            },
            context: {
              type: 'string',
              description: 'Context or explanation for the statistic'
            },
            source: {
              type: 'string',
              description: 'Source of the statistic'
            }
          },
          required: ['metric', 'value']
        }
      },
      trends: {
        type: 'array',
        description: 'Identified trends in the research area',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the trend'
            },
            description: {
              type: 'string',
              description: 'Description of the trend'
            },
            direction: {
              type: 'string',
              description: 'Direction of the trend',
              enum: ['increasing', 'decreasing', 'stable', 'fluctuating', 'emerging']
            },
            timeframe: {
              type: 'string',
              description: 'Timeframe of the trend'
            }
          },
          required: ['name', 'description', 'direction']
        }
      }
    },
    required: ['domain']
  }
};

/**
 * Tool for generating research questions based on content analysis
 */
export const researchQuestionsGenerator: ToolFunction = {
  name: 'generate_research_questions',
  description: 'Generate follow-up research questions based on content analysis',
  parameters: {
    type: 'object',
    properties: {
      primaryQuestions: {
        type: 'array',
        description: 'Primary follow-up questions that would yield valuable insights',
        items: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The research question'
            },
            rationale: {
              type: 'string',
              description: 'Rationale for why this question is important'
            },
            expectedInsightValue: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Expected value of insights from this question'
            }
          },
          required: ['question', 'rationale', 'expectedInsightValue']
        }
      },
      knowledgeGaps: {
        type: 'array',
        description: 'Identified knowledge gaps in the current research',
        items: {
          type: 'string'
        }
      },
      researchApproach: {
        type: 'object',
        description: 'Suggested approach for follow-up research',
        properties: {
          recommendedSources: {
            type: 'array',
            description: 'Types of sources recommended for follow-up',
            items: {
              type: 'string'
            }
          },
          suggestedMethodology: {
            type: 'string',
            description: 'Suggested methodology for follow-up research'
          }
        }
      }
    },
    required: ['primaryQuestions']
  }
};

/**
 * Export all tool functions as a collection
 */
export const researchTools = {
  researchInsightsExtractor,
  sourceEvaluationExtractor,
  domainSpecificExtractor,
  researchQuestionsGenerator
};

/**
 * Export all validation schemas
 */
export const validationSchemas = {
  researchInsightsSchema,
  sourceEvaluationSchema
};
