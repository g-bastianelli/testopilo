import { z } from 'zod';
import { validateEnv } from '@utils/config';

const envSchema = z.object({
  VERSION: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3000'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  XAI_API_KEY: z.string().min(1, 'XAI_API_KEY is required'),
});

export const env = validateEnv('@testopilo/lmnp-backend', envSchema);
