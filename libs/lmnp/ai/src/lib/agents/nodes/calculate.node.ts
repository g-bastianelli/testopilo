/**
 * Calculate Node - Performs LMNP simulation calculations
 * Pure function for LangGraph workflow
 */

import { logger } from '@utils/logger';
import type { CompleteSimulationData, RegimeComparison } from '@lmnp/shared';
import { compareRegimes } from '../../calculations.js';

/**
 * Calculate node - Performs LMNP simulation calculations
 */
export async function calculateNode(state: {
  updatedData: CompleteSimulationData;
}): Promise<{
  calculationResult: RegimeComparison;
}> {
  logger.info({ msg: '[Calculate Node] Starting calculation' });

  const calculationResult = compareRegimes(state.updatedData);

  if (!calculationResult) {
    throw new Error('Calculation failed');
  }

  logger.info({
    msg: '[Calculate Node] Calculation complete',
    recommendedRegime: calculationResult.recommendedRegime,
  });

  return {
    calculationResult,
  };
}
