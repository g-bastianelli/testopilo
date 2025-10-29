/**
 * Explain Node - Generates pedagogical explanation of LMNP simulation results
 * Pure function for LangGraph workflow
 */

import { logger } from '@utils/logger';
import type { RegimeComparison, SimulationData } from '@lmnp/shared';
import { ChatXAI } from '@langchain/xai';
import { env } from '../../env.js';

/**
 * Build explanation prompt with simulation data and results
 */
function buildExplanationPrompt(
  simulationData: SimulationData,
  calculationResults: RegimeComparison
): string {
  return `Tu es un conseiller fiscal LMNP qui explique des résultats de simulation.

DONNÉES DU PROJET :
- Prix d'achat : ${simulationData.purchasePrice?.toLocaleString()} €
- Loyer mensuel : ${simulationData.monthlyRent?.toLocaleString()} €/mois (${(
    simulationData.monthlyRent! * 12
  ).toLocaleString()} €/an)
- Charges annuelles : ${simulationData.annualExpenses?.toLocaleString()} €
- Durée : ${simulationData.holdingPeriod} ans
- TMI : ${simulationData.taxRate}%

RÉSULTATS CALCULÉS (à utiliser tels quels, ne recalcule rien) :

MICRO-BIC :
- Impôt : ${calculationResults.microBic.tax.toLocaleString()} €/an
- Revenu net : ${calculationResults.microBic.netIncome.toLocaleString()} €/an

RÉGIME RÉEL :
- Impôt : ${calculationResults.realRegime.tax.toLocaleString()} €/an
- Revenu net : ${calculationResults.realRegime.netIncome.toLocaleString()} €/an
- Amortissement : ${calculationResults.realRegime.depreciation?.toLocaleString()} €/an

COMPARAISON :
- Économie annuelle : ${calculationResults.annualSavings.toLocaleString()} €
- Économie totale sur ${
    simulationData.holdingPeriod
  } ans : ${calculationResults.totalSavings.toLocaleString()} €
- Recommandation : ${calculationResults.recommendedRegime}

Génère une explication claire et pédagogique (3-4 paragraphes max) qui :
1. Indique quel régime est recommandé et pourquoi
2. Cite les chiffres clés
3. Reste simple et accessible

IMPORTANT : Utilise UNIQUEMENT les chiffres fournis, ne calcule rien toi-même.`;
}

/**
 * Explain node - Generates pedagogical explanation of results
 */
export async function explainNode(state: {
  updatedData?: SimulationData;
  calculationResult?: RegimeComparison;
  extractionMessage?: string;
}): Promise<{
  finalMessage: string;
  simulationResult: RegimeComparison;
}> {
  logger.info({ msg: '[Explain Node] Generating explanation' });

  if (!state.updatedData || !state.calculationResult) {
    throw new Error('Missing data for explanation');
  }

  try {
    const model = new ChatXAI({
      model: 'grok-4-fast-non-reasoning',
      temperature: 0.8,
      apiKey: env.XAI_API_KEY,
    });

    const prompt = buildExplanationPrompt(
      state.updatedData,
      state.calculationResult
    );

    const response = await model.invoke(prompt);

    logger.info({ msg: '[Explain Node] Explanation generated' });

    // Use only the explanation, ignore extractionMessage when we have results
    const finalMessage = response.content as string;

    return {
      finalMessage,
      simulationResult: state.calculationResult,
    };
  } catch (err) {
    logger.error({ msg: '[Explain Node] Execution error', err });
    throw new Error('Error generating explanation', { cause: err });
  }
}
