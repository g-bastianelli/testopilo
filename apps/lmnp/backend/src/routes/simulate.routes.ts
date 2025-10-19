/**
 * Simulation route - POST /simulate
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { logger } from '@testopilo/logger';
import {
  SimulationDataSchema,
  RegimeComparisonSchema,
  compareRegimes,
  isSimulationDataComplete,
} from '@testopilo/lmnp-shared';

const simulate = new Hono();

simulate.post('/', zValidator('json', SimulationDataSchema), async (c) => {
  try {
    const data = c.req.valid('json');

    logger.info({
      msg: 'Simulation request received',
      purchasePrice: data.purchasePrice,
      monthlyRent: data.monthlyRent,
    });

    // Check if all required data is provided
    if (!isSimulationDataComplete(data)) {
      return c.json(
        {
          error: 'Incomplete simulation data',
          message:
            'All required fields must be provided (purchasePrice, monthlyRent, annualExpenses, holdingPeriod, taxRate)',
        },
        400
      );
    }

    // Perform calculation (pure function, no hallucination)
    const result = compareRegimes(data);

    if (!result) {
      return c.json({ error: 'Failed to calculate simulation' }, 500);
    }

    // Validate response with Zod
    const validatedResponse = RegimeComparisonSchema.parse(result);

    logger.info({
      msg: 'Simulation completed',
      recommendedRegime: result.recommendedRegime,
      annualSavings: result.annualSavings,
    });

    return c.json(validatedResponse);
  } catch (error) {
    logger.error({ msg: 'Simulation error', error });
    return c.json({ error: 'Failed to process simulation request' }, 500);
  }
});

export default simulate;
