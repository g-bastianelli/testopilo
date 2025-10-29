import { z } from 'zod';
import { validateEnv } from './config.js';

describe('validateEnv', () => {
  it('should validate environment variables', () => {
    const schema = z.object({
      NODE_ENV: z.string().optional(),
    });

    const result = validateEnv('test-package', schema);
    expect(result).toBeDefined();
  });

  it('should throw error for invalid environment variables', () => {
    const schema = z.object({
      REQUIRED_VAR: z.string(),
    });

    expect(() => {
      validateEnv('test-package', schema);
    }).toThrow('test-package has invalid environment variables');
  });
});
