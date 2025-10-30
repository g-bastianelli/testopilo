/**
 * AI SDK tool for LMNP calculation
 * Standard AI SDK tool - stateless and returns structured data
 */

import { tool } from 'ai';
import { logger } from '@utils/logger';
import { CompleteSimulationDataSchema } from '@lmnp/shared';
import { compareRegimes } from '../../calculations.js';

/**
 * Standard AI SDK tool for calculating LMNP simulation
 * Takes simulation data as input and returns calculation results
 */
export const calculateLmnpTool = tool({
  description:
    'Calculate the complete LMNP fiscal simulation comparing Micro-BIC and Real Regime (Régime Réel). Call this tool ONLY when all required data is complete (purchase price, monthly rent, annual expenses, holding period, and tax rate). This tool performs all tax calculations and returns detailed comparison results with recommendation. NEVER attempt to calculate taxes yourself - always use this tool.',
  inputSchema: CompleteSimulationDataSchema,
  execute: async (input) => {
    const {
      purchasePrice,
      monthlyRent,
      annualExpenses,
      holdingPeriod,
      taxRate,
      loanAmount,
      interestRate,
      loanDuration,
    } = input;
    try {
      const comparisonResult = compareRegimes({
        purchasePrice,
        monthlyRent,
        annualExpenses,
        holdingPeriod,
        taxRate,
        loanAmount: loanAmount ?? null,
        interestRate: interestRate ?? null,
        loanDuration: loanDuration ?? null,
      });

      if (!comparisonResult) {
        logger.error({ msg: 'Calculation failed despite complete data' });
        return {
          success: false,
          error: 'Erreur lors du calcul de la simulation',
        };
      }

      logger.info({
        msg: 'LMNP simulation calculated successfully',
        recommendedRegime: comparisonResult.recommendedRegime,
        annualSavings: comparisonResult.annualSavings,
      });

      // Return structured data
      return {
        success: true,
        result: comparisonResult,
      };
    } catch (err) {
      logger.error({ msg: 'Tool execution error', err });
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
