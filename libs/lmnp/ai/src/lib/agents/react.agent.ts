/**
 * ReAct Agent for LMNP Chat
 * Single autonomous agent that extracts data, calculates, and explains
 *
 * Flow:
 * 1. User sends message
 * 2. Agent decides to call update_simulation_data tool
 * 3. If data complete, agent calls calculate_lmnp_simulation
 * 4. Agent explains results to user
 */

import { generateText, stepCountIs } from 'ai';
import { createXai } from '@ai-sdk/xai';
import { logger } from '@utils/logger';
import { ChatMessage, RegimeComparison, SimulationData } from '@lmnp/shared';
import { updateSimulationDataTool } from './tools/update-simulation-data.tool.js';
import { calculateLmnpTool } from './tools/calculate-lmnp.tool.js';
import { env } from '../env.js';

/**
 * Build concise system prompt for the ReAct agent
 */
function buildAgentPrompt(currentData: SimulationData): string {
  const missing: string[] = [];
  if (currentData.purchasePrice === null) missing.push("prix d'achat");
  if (currentData.monthlyRent === null) missing.push('loyer mensuel');
  if (currentData.annualExpenses === null) missing.push('charges annuelles');
  if (currentData.holdingPeriod === null) missing.push('durée de détention');
  if (currentData.taxRate === null) missing.push('TMI');

  const status =
    missing.length > 0
      ? `⚠️ Manque: ${missing.join(', ')}`
      : '✅ Données complètes → Appelle calculate_lmnp_simulation';

  return `Conseiller fiscal LMNP. Extrais les données, calcule avec les outils, explique en français.

OUTILS:
- update_simulation_data: Extrait données du message user
- calculate_lmnp_simulation: Calcule (UNIQUEMENT si données complètes)

RÈGLES:
- Appelle update_simulation_data dès qu'un user donne une info
- NE CALCULE JAMAIS toi-même, utilise l'outil
- Explique les résultats de façon pédagogique
- Réponds UNIQUEMENT sur LMNP (location meublée)

État actuel: ${status}`;
}

/**
 * Convert ChatMessage[] to AI SDK messages format
 */
function convertToAISDKMessages(messages: ChatMessage[]) {
  return messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
}

/**
 * Run the ReAct agent for a chat conversation
 */
export async function runLmnpAgent(
  messages: ChatMessage[],
  currentData: SimulationData
): Promise<{
  message: string;
  updatedData: SimulationData;
  simulationResult?: RegimeComparison;
}> {
  try {
    logger.info({
      msg: '[ReAct Agent] Starting execution',
      messagesCount: messages.length,
    });

    const systemPrompt = buildAgentPrompt(currentData);
    const aiMessages = convertToAISDKMessages(messages);

    logger.info({
      msg: '[ReAct Agent] Invoking agent with AI SDK',
      totalMessages: aiMessages.length,
    });

    // Invoke the agent with AI SDK
    const xai = createXai({
      apiKey: env.XAI_API_KEY,
    });

    const result = await generateText({
      model: xai('grok-4-fast-non-reasoning'),
      system: systemPrompt,
      messages: aiMessages,
      tools: {
        update_simulation_data: updateSimulationDataTool,
        calculate_lmnp_simulation: calculateLmnpTool,
      },
      stopWhen: stepCountIs(5),
      temperature: 0.7,
    });

    logger.info({
      msg: '[ReAct Agent] Execution completed',
      finishReason: result.finishReason,
      stepsCount: result.steps?.length,
    });

    // Extract data updates and simulation results from tool results
    let updatedData = { ...currentData };
    let simulationResult: RegimeComparison | undefined = undefined;

    // Parse steps for tool results
    for (const step of result.steps || []) {
      if (step.toolResults && step.toolResults.length > 0) {
        for (const toolResult of step.toolResults) {
          logger.info({
            msg: '[ReAct Agent] Tool result detected',
            toolName: toolResult.toolName,
          });

          const resultData = toolResult.output as any;

          // Extract data updates from update_simulation_data tool
          if (
            toolResult.toolName === 'update_simulation_data' &&
            resultData.success
          ) {
            updatedData = { ...updatedData, ...resultData.data };
            logger.info({
              msg: '[ReAct Agent] Data updated',
              updatedFields: Object.keys(resultData.data),
            });
          }

          // Extract simulation result from calculate tool
          if (
            toolResult.toolName === 'calculate_lmnp_simulation' &&
            resultData.success
          ) {
            simulationResult = resultData.result;
            logger.info({
              msg: '[ReAct Agent] Simulation calculated',
              recommendedRegime: simulationResult?.recommendedRegime,
            });
          }
        }
      }
    }

    return {
      message: result.text,
      updatedData,
      simulationResult,
    };
  } catch (err) {
    logger.error({
      msg: '[ReAct Agent] Execution error',
      err,
      error: err instanceof Error ? err.message : String(err),
    });
    throw new Error('Error running ReAct agent', { cause: err });
  }
}
