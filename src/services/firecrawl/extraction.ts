import { DeepResearchResponse, ResearchSource, ResearchActivity } from './types.js';
import logger from '../../utils/logger.js';
import { FirecrawlError } from '../../utils/errors.js';

/**
 * Data extraction utilities for Firecrawl research results
 */

export interface ExtractedInsight {
  topic: string;
  content: string;
  confidence: number;
  sources: string[];
}

export interface ExtractedResearch {
  summary: string;
  insights: ExtractedInsight[];
  sources: ResearchSource[];
  activities: ResearchActivity[];
  metadata: {
    queryTime: number;
    sourceCount: number;
    topDomains: string[];
    completionDate: string;
  };
}

/**
 * Extract structured data from deep research results
 */
export function extractResearchData(response: DeepResearchResponse): ExtractedResearch {
  if (!response || response.status !== 'completed') {
    throw new FirecrawlError(
      `Cannot extract data from incomplete research (status: ${response.status})`,
      400
    );
  }

  if (!response.data || !response.data.finalAnalysis) {
    throw new FirecrawlError('Research data is missing or incomplete', 400);
  }

  const { finalAnalysis, activities = [], sources = [] } = response.data;
  
  // Extract insights from the analysis
  const insights = extractInsights(finalAnalysis, sources);
  
  // Extract top domains from sources
  const topDomains = extractTopDomains(sources);
  
  // Calculate query time if timestamps are available
  const queryTime = calculateQueryTime(response);
  
  return {
    summary: extractSummary(finalAnalysis),
    insights,
    sources: enhanceSources(sources),
    activities: activities.filter(a => a.type && (a.result || a.url)),
    metadata: {
      queryTime,
      sourceCount: sources.length,
      topDomains,
      completionDate: response.completedAt || new Date().toISOString(),
    }
  };
}

/**
 * Extract a concise summary from the final analysis
 */
function extractSummary(analysis: string): string {
  // Look for a summary section in the analysis
  const summaryMatch = analysis.match(/(?:summary|overview|conclusion):\s*([\s\S]+?)(?:\n\n|\n#|\n##|$)/i);
  
  if (summaryMatch && summaryMatch[1]) {
    // Clean up and return the found summary
    return summaryMatch[1].trim().replace(/\n+/g, ' ');
  }
  
  // If no summary section found, use the first paragraph
  const firstParagraph = analysis.split('\n\n')[0];
  if (firstParagraph && firstParagraph.length > 100) {
    return firstParagraph.trim();
  }
  
  // If first paragraph is too short, use first 250 chars
  return analysis.substring(0, 250).trim() + '...';
}

/**
 * Extract key insights from the analysis text
 */
function extractInsights(analysis: string, sources: ResearchSource[]): ExtractedInsight[] {
  const insights: ExtractedInsight[] = [];
  const sourceUrls = sources.map(s => s.url);
  
  // Look for section headers as potential topics
  const sectionMatches = analysis.matchAll(/#+\s+(.+)\n+([\s\S]+?)(?=\n#+\s+|$)/g);
  
  for (const match of sectionMatches) {
    if (match[1] && match[2]) {
      const topic = match[1].trim();
      const content = match[2].trim();
      
      // Skip if it's a common section that's not an insight
      if (/^(introduction|conclusion|summary|references|sources)$/i.test(topic)) {
        continue;
      }
      
      // Find source references in the content
      const contentSourceRefs = findSourceReferences(content, sourceUrls);
      
      insights.push({
        topic,
        content,
        confidence: calculateConfidence(content, contentSourceRefs.length),
        sources: contentSourceRefs
      });
    }
  }
  
  // If no sections found or too few insights, extract from paragraphs
  if (insights.length < 3) {
    const paragraphs = analysis.split('\n\n');
    
    for (let i = 0; i < paragraphs.length && insights.length < 5; i++) {
      const paragraph = paragraphs[i].trim();
      
      // Skip short paragraphs
      if (paragraph.length < 100 || paragraph.startsWith('#')) {
        continue;
      }
      
      // Generate a topic from the paragraph
      const topic = generateTopicFromParagraph(paragraph);
      
      // Find source references
      const contentSourceRefs = findSourceReferences(paragraph, sourceUrls);
      
      insights.push({
        topic,
        content: paragraph,
        confidence: calculateConfidence(paragraph, contentSourceRefs.length),
        sources: contentSourceRefs
      });
    }
  }
  
  return insights;
}

/**
 * Generate a topic from paragraph content
 */
function generateTopicFromParagraph(paragraph: string): string {
  // Use the first sentence as a basis for the topic
  const firstSentence = paragraph.split(/[.!?]/, 1)[0].trim();
  
  if (firstSentence.length < 60) {
    return firstSentence;
  }
  
  // If first sentence is too long, extract key phrases
  const keyPhrases = firstSentence.match(/(?:"([^"]+)"|([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+))/g);
  
  if (keyPhrases && keyPhrases.length > 0) {
    return keyPhrases[0].replace(/"/g, '');
  }
  
  // Fallback to first 50 chars
  return firstSentence.substring(0, 50) + '...';
}

/**
 * Find source references in content
 */
function findSourceReferences(content: string, sourceUrls: string[]): string[] {
  const foundSources = new Set<string>();
  
  // Look for URL patterns in the content
  const urlMatches = content.match(/https?:\/\/[^\s)]+/g) || [];
  
  for (const url of urlMatches) {
    // Find the matching source URL
    const matchedSource = sourceUrls.find(sourceUrl => 
      url.includes(sourceUrl) || sourceUrl.includes(url)
    );
    
    if (matchedSource) {
      foundSources.add(matchedSource);
    }
  }
  
  // Look for numbered references [1], [2], etc.
  const refMatches = content.match(/\[(\d+)\]/g) || [];
  
  for (const refMatch of refMatches) {
    const refNum = parseInt(refMatch.replace(/[\[\]]/g, ''), 10);
    
    // If reference number is valid and within sources range
    if (!isNaN(refNum) && refNum > 0 && refNum <= sourceUrls.length) {
      foundSources.add(sourceUrls[refNum - 1]);
    }
  }
  
  return Array.from(foundSources);
}

/**
 * Calculate confidence score based on content and source count
 */
function calculateConfidence(content: string, sourceCount: number): number {
  // Base confidence on content length and source count
  const lengthScore = Math.min(content.length / 500, 0.5);
  const sourceScore = Math.min(sourceCount * 0.1, 0.5);
  
  // Adjust based on certainty language
  const uncertaintyPhrases = [
    'may ', 'might ', 'could ', 'possibly', 'perhaps', 'unclear', 
    'not certain', 'debated', 'controversial'
  ];
  
  const certaintyPhrases = [
    'definitely', 'clearly', 'certainly', 'without doubt', 'conclusively',
    'research shows', 'studies confirm', 'evidence indicates'
  ];
  
  let phraseAdjustment = 0;
  
  // Check for uncertainty phrases
  for (const phrase of uncertaintyPhrases) {
    if (content.toLowerCase().includes(phrase)) {
      phraseAdjustment -= 0.05;
    }
  }
  
  // Check for certainty phrases
  for (const phrase of certaintyPhrases) {
    if (content.toLowerCase().includes(phrase)) {
      phraseAdjustment += 0.05;
    }
  }
  
  // Calculate final confidence score (0.0 to 1.0)
  const rawScore = lengthScore + sourceScore + phraseAdjustment;
  return Math.max(0.1, Math.min(1.0, rawScore));
}

/**
 * Enhance sources with additional metadata
 */
function enhanceSources(sources: ResearchSource[]): ResearchSource[] {
  return sources.map(source => {
    // Extract domain from URL
    const domain = extractDomain(source.url);
    
    // Determine relevance if not already set
    const relevance = source.relevance || determineRelevance(source);
    
    return {
      ...source,
      relevance,
      domain
    };
  });
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // If URL parsing fails, try a regex approach
    const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/i);
    return domainMatch ? domainMatch[1] : '';
  }
}

/**
 * Determine source relevance based on available data
 */
function determineRelevance(source: ResearchSource): 'high' | 'medium' | 'low' {
  // If we have a snippet, use its length as a heuristic
  if (source.snippet) {
    if (source.snippet.length > 500) return 'high';
    if (source.snippet.length > 200) return 'medium';
    return 'low';
  }
  
  // If we have a title, use presence of keywords
  if (source.title) {
    const keywordIndicators = [
      'research', 'study', 'analysis', 'report', 'official', 
      'data', 'statistics', 'survey', 'review', 'comprehensive'
    ];
    
    for (const keyword of keywordIndicators) {
      if (source.title.toLowerCase().includes(keyword)) {
        return 'high';
      }
    }
  }
  
  // Default to medium relevance
  return 'medium';
}

/**
 * Extract top domains from sources
 */
function extractTopDomains(sources: ResearchSource[]): string[] {
  const domainCounts = new Map<string, number>();
  
  // Count occurrences of each domain
  for (const source of sources) {
    const domain = extractDomain(source.url);
    if (domain) {
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
  }
  
  // Sort domains by count and return top 5
  return Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain]) => domain);
}

/**
 * Calculate query time in seconds if timestamps are available
 */
function calculateQueryTime(response: DeepResearchResponse): number {
  if (response.createdAt && response.completedAt) {
    const startTime = new Date(response.createdAt).getTime();
    const endTime = new Date(response.completedAt).getTime();
    
    return Math.round((endTime - startTime) / 1000);
  }
  
  return 0;
}
