import { 
  createOpenAIClient, 
  OpenAIModel, 
  researchTools, 
  validationSchemas 
} from '../services/openai/index.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Advanced OpenAI analysis example
 * 
 * This example demonstrates:
 * 1. Streaming responses for real-time updates
 * 2. Parallel execution of multiple analysis tasks
 * 3. Structured data extraction with schema validation
 * 4. Using specialized research tools
 */

async function runAdvancedAnalysis() {
  try {
    logger.info('Starting advanced OpenAI analysis example');
    
    // Initialize OpenAI client
    const openaiClient = createOpenAIClient();
    
    // Sample research content - in a real scenario, this would come from Firecrawl
    const researchContent = `
      # Environmental Impact of Electric Vehicles vs. Gasoline Vehicles
      
      ## Key Findings
      
      Recent studies from MIT (2023) indicate that electric vehicles produce approximately 50% fewer greenhouse gas emissions over their lifetime compared to gasoline vehicles, even when accounting for battery production and electricity generation. However, this advantage varies significantly by region depending on the local electricity grid's carbon intensity.
      
      The International Energy Agency (IEA) reported in 2024 that electric vehicles require 30-40% less energy per mile traveled compared to internal combustion engines. This efficiency advantage increases in urban environments with frequent stop-and-go traffic.
      
      ## Manufacturing Impact
      
      Electric vehicle battery production remains energy-intensive, with the mining of lithium, cobalt, and nickel creating significant environmental concerns. A 2023 study in Nature Sustainability found that battery production accounts for 35-50% of an electric vehicle's total manufacturing carbon footprint.
      
      However, advances in battery technology are reducing these impacts. Tesla and CATL have reported a 20% reduction in battery production emissions between 2020-2023 through improved manufacturing processes and increased use of renewable energy in their factories.
      
      ## Operational Emissions
      
      The Union of Concerned Scientists found that in the United States, electric vehicles produce lower emissions than the most efficient gasoline vehicles in 95% of the country. In regions with the cleanest electricity grids, electric vehicles produce emissions equivalent to a gasoline vehicle achieving over 150 miles per gallon.
      
      A controversial study from the American Petroleum Institute in 2022 claimed that when accounting for all lifecycle emissions, the advantage of electric vehicles is minimal. However, this study has been criticized for methodological flaws and outdated data by multiple independent research organizations.
      
      ## End-of-Life Considerations
      
      Battery recycling remains a challenge, though recent technological advances are promising. A 2024 report from Bloomberg NEF indicates that 80% of lithium-ion battery materials can now be recovered through advanced recycling processes, up from 50% in 2020.
      
      ## Future Trends
      
      The carbon intensity of electricity grids is decreasing globally, with renewable energy capacity growing at record rates. The IEA projects that by 2030, the lifecycle emissions advantage of electric vehicles will increase to 60-70% in most developed countries as grids become cleaner.
    `;
    
    // Example 1: Streaming structured analysis
    logger.info('Example 1: Streaming structured analysis');
    
    console.log('\n--- STREAMING ANALYSIS ---\n');
    
    const streamGenerator = openaiClient.structuredAnalysisStream({
      content: `Analyze the following research content and extract key insights:\n\n${researchContent}`,
      functions: [researchTools.researchInsightsExtractor],
      functionName: 'extract_research_insights',
      schema: validationSchemas.researchInsightsSchema,
      model: OpenAIModel.GPT4O_LATEST
    });
    
    // Process the stream in real-time
    let streamedContent = '';
    for await (const chunk of streamGenerator) {
      if (chunk.content) {
        process.stdout.write(chunk.content);
        streamedContent += chunk.content;
      }
      
      if (chunk.functionName) {
        console.log(`\n\nFunction called: ${chunk.functionName}`);
      }
      
      if (chunk.functionArguments) {
        // In a real application, you might want to display partial results
        // Here we'll just show progress
        process.stdout.write('.');
      }
      
      if (chunk.isComplete) {
        console.log('\n\nStream complete!');
      }
    }
    
    // The generator returns the final result when done
    const streamResult = await streamGenerator.next();
    const structuredData = streamResult.value;
    
    console.log('\nExtracted insights:');
    console.log(`Title: ${structuredData.result.title}`);
    console.log(`Key insights: ${structuredData.result.keyInsights.length}`);
    
    if (structuredData.validationErrors) {
      console.log('\nValidation errors:', structuredData.validationErrors.format());
    } else {
      console.log('\nData passed schema validation');
    }
    
    // Example 2: Parallel analysis
    logger.info('Example 2: Parallel analysis');
    
    console.log('\n--- PARALLEL ANALYSIS ---\n');
    
    // Define multiple analysis tasks
    const analysisTopics = [
      'Environmental impact of manufacturing',
      'Operational emissions comparison',
      'Battery recycling and end-of-life considerations',
      'Future trends and projections'
    ];
    
    const parallelResults = await openaiClient.parallelAnalysis({
      tasks: analysisTopics.map(topic => ({
        content: `Regarding the topic "${topic}" in the context of electric vehicles vs. gasoline vehicles, provide a concise summary based on this research:\n\n${researchContent}`,
        systemPrompt: 'You are a research assistant specializing in environmental impact analysis. Provide concise, fact-based summaries.',
        model: OpenAIModel.GPT4O_LATEST,
        temperature: 0.1,
        maxTokens: 300
      })),
      maxConcurrent: 2
    });
    
    // Display the results
    console.log(`Completed ${parallelResults.length} parallel analyses:\n`);
    
    parallelResults.forEach((result, index) => {
      console.log(`Topic ${index + 1}: ${analysisTopics[index]}`);
      console.log('-------------------------------------------');
      console.log(result.content.substring(0, 200) + '...');
      console.log(`[Tokens used: ${result.usage.totalTokens}]\n`);
    });
    
    // Example 3: Source evaluation
    logger.info('Example 3: Source evaluation');
    
    console.log('\n--- SOURCE EVALUATION ---\n');
    
    const sourceEvaluation = await openaiClient.structuredAnalysis({
      content: `Evaluate the credibility and relevance of the sources mentioned in this research:\n\n${researchContent}`,
      functions: [researchTools.sourceEvaluationExtractor],
      functionName: 'evaluate_sources',
      schema: validationSchemas.sourceEvaluationSchema,
      model: OpenAIModel.GPT4O_LATEST
    });
    
    console.log('Source evaluation:');
    console.log(`Found ${sourceEvaluation.result.sources.length} sources`);
    console.log(`Overall assessment: ${sourceEvaluation.result.overallAssessment.substring(0, 100)}...`);
    
    if (sourceEvaluation.result.sourceDiversity) {
      console.log('\nSource diversity metrics:');
      const diversity = sourceEvaluation.result.sourceDiversity;
      
      if (diversity.domainDiversity !== undefined) {
        console.log(`Domain diversity: ${Math.round(diversity.domainDiversity * 100)}%`);
      }
      
      if (diversity.perspectiveDiversity !== undefined) {
        console.log(`Perspective diversity: ${Math.round(diversity.perspectiveDiversity * 100)}%`);
      }
    }
    
    // Example 4: Generate research questions
    logger.info('Example 4: Generate research questions');
    
    console.log('\n--- RESEARCH QUESTIONS ---\n');
    
    const researchQuestions = await openaiClient.structuredAnalysis({
      content: `Based on this research content, generate follow-up research questions:\n\n${researchContent}`,
      functions: [researchTools.researchQuestionsGenerator],
      functionName: 'generate_research_questions',
      model: OpenAIModel.GPT4O_LATEST
    });
    
    console.log('Generated research questions:');
    researchQuestions.result.primaryQuestions.forEach((q, i) => {
      console.log(`\n${i + 1}. ${q.question}`);
      console.log(`   Rationale: ${q.rationale.substring(0, 100)}...`);
      console.log(`   Expected value: ${q.expectedInsightValue}`);
    });
    
    if (researchQuestions.result.knowledgeGaps) {
      console.log('\nIdentified knowledge gaps:');
      researchQuestions.result.knowledgeGaps.forEach((gap, i) => {
        console.log(`- ${gap}`);
      });
    }
    
    logger.info('Advanced OpenAI analysis example completed successfully');
    
  } catch (error) {
    logger.error('Analysis failed:', error);
    process.exit(1);
  }
}

// Run the example
runAdvancedAnalysis().catch(console.error);
