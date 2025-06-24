import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

// Define environment variable schema with validation
const envSchema = z.object({
  // API Keys (required)
  FIRECRAWL_API_KEY: z.string().min(1, 'FIRECRAWL_API_KEY is required'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  
  // Server Configuration
  PORT: z.string().transform(Number).default('3000'),
  
  // Research Configuration
  MAX_DEPTH: z.string().transform(Number).default('3'),
  MAX_URLS: z.string().transform(Number).default('20'),
  TIME_LIMIT: z.string().transform(Number).default('120'),
  
  // OpenAI Model Configuration
  OPENAI_MODEL: z.string().default('chatgpt-4o-latest'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envResult.error.format());
  throw new Error('Invalid environment variables');
}

// Export validated environment variables
export const env = envResult.data;

// Export project paths
export const paths = {
  root: projectRoot,
  src: path.join(projectRoot, 'src'),
  logs: path.join(projectRoot, 'logs'),
};
