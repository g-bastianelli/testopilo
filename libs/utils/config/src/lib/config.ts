import { z } from 'zod';

/**
 * Validate environment variables with Zod schema
 * @param packageName - Name of the package, used in error message
 * @param schema - Zod schema to validate against
 */
function validateEnv<T extends z.ZodObject>(
  packageName: string,
  schema: T
): z.infer<T> {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`${packageName} has invalid environment variables`, {
      cause: z.prettifyError(parsed.error),
    });
  }

  return parsed.data;
}

export { validateEnv };
