/**
 * LangChain tool for LMNP AI service
 * Updates simulation data by merging current data with extracted data
 */

import { tool } from '@langchain/core/tools';
import { logger } from '@utils/logger';
import { z } from 'zod';
import {
  SimulationData,
  SimulationDataSchema,
  UpdateSimulationSchema,
} from '@lmnp/shared';

/**
 * Tool input schema: receives current data + extracted fields
 */
const ToolInputSchema = z.object({
  currentData: SimulationDataSchema,
  extractedData: UpdateSimulationSchema,
});

type ToolOutput =
  | {
      succes: true;
      data: SimulationData;
    }
  | {
      succes: false;
      error: string;
    };

/**
 * Update simulation data tool
 * Simply merges current data with newly extracted data
 */
export const updateSimulationDataTool = tool(
  async (input): Promise<ToolOutput> => {
    try {
      // Validate input structure
      const { currentData, extractedData } = ToolInputSchema.parse(input);

      // Merge current data with extracted data
      const updatedData = { ...currentData, ...extractedData };

      return {
        succes: true,
        data: updatedData,
      };
    } catch (err) {
      logger.error({ msg: 'Tool: execution error', err });
      return {
        succes: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
  {
    name: 'update_simulation_data',
    description:
      'Update simulation data by merging current data with newly extracted fields. ALWAYS pass both currentData (current state) and extractedData (new fields from user message).',
    schema: ToolInputSchema,
  }
);
