import { z } from 'zod';
import { validateEnv } from '@utils/config';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  XAI_API_KEY: z.string().min(1, 'XAI_API_KEY is required'),
});

export const env = validateEnv('@lmnp/ai', envSchema);
