import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  // Ollama
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('llama2'),

  // ChromaDB
  CHROMA_HOST: z.string().default('localhost'),
  CHROMA_PORT: z.string().transform(Number).default('8000'),
  CHROMA_COLLECTION: z.string().default('rag_agro_docs'),

  // Storage
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  ALLOWED_MIME_TYPES: z.string().default('application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),

  // Redis
  REDIS_URL: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // RAG Settings
  CHUNK_SIZE: z.string().transform(Number).default('1000'),
  CHUNK_OVERLAP: z.string().transform(Number).default('200'),
  TOP_K_RESULTS: z.string().transform(Number).default('5'),
  SIMILARITY_THRESHOLD: z.string().transform(Number).default('0.7'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

export const env = parseEnv();