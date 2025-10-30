/**
 * AI SDK tool for LMNP AI service
 * Updates simulation data by merging current data with extracted data
 */

import { tool } from 'ai';
import { logger } from '@utils/logger';
import { z } from 'zod';
import { SimulationDataSchema, UpdateSimulationSchema } from '@lmnp/shared';

/**
 * Tool input schema: receives current data + extracted fields
 */
const ToolInputSchema = z.object({
  currentData: SimulationDataSchema,
  extractedData: UpdateSimulationSchema,
});

const OutputSchema = z.union([
  z.object({
    success: z.literal(true),
    data: SimulationDataSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

/**
 * Update simulation data tool
 * Simply merges current data with newly extracted data
 */
export const updateSimulationDataTool = tool({
  description:
    'Update simulation data by merging current data with newly extracted fields. ALWAYS pass both currentData (current state) and extractedData (new fields from user message).',
  inputSchema: ToolInputSchema,
  outputSchema: OutputSchema,
  execute: async (input) => {
    const { currentData, extractedData } = input;
    try {
      // Merge current data with extracted data
      const updatedData = {
        ...currentData,
        ...extractedData,
      };

      return {
        success: true,
        data: updatedData,
      };
    } catch (err) {
      logger.error({ msg: 'Tool: execution error', err });
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
