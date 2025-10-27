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

import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatXAI } from '@langchain/xai';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
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
 * Convert ChatMessage[] to LangChain messages, preserving roles
 */
function convertToLangChainMessages(
  messages: ChatMessage[],
  systemPrompt: string
) {
  return [
    new SystemMessage(systemPrompt),
    ...messages.map((msg) => {
      if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    }),
  ];
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

    // Create model
    const model = new ChatXAI({
      model: 'grok-4-fast-non-reasoning',
      temperature: 0.7,
      apiKey: env.XAI_API_KEY,
    });

    // Use stateless tools
    const tools = [updateSimulationDataTool, calculateLmnpTool];

    logger.info({
      msg: '[ReAct Agent] Creating agent',
      toolsCount: tools.length,
      tools: tools.map((t) => t.name),
    });

    const agent = createReactAgent({
      llm: model,
      tools,
    });

    const systemPrompt = buildAgentPrompt(currentData);

    // Build message history - preserve assistant messages
    const langchainMessages = convertToLangChainMessages(
      messages,
      systemPrompt
    );

    logger.info({
      msg: '[ReAct Agent] Invoking agent',
      totalMessages: langchainMessages.length,
    });

    // Invoke the agent
    const result = await agent.invoke({
      messages: langchainMessages,
    });

    logger.info({
      msg: '[ReAct Agent] Execution completed',
      resultMessagesCount: result.messages?.length,
    });

    // Extract the final AI message
    const aiMessages = result.messages.filter(
      (msg) => msg instanceof AIMessage
    );
    const finalMessage = aiMessages[aiMessages.length - 1]?.content || '';

    logger.info({
      msg: '[ReAct Agent] Final message extracted',
      messageLength: typeof finalMessage === 'string' ? finalMessage.length : 0,
      aiMessagesCount: aiMessages.length,
    });

    // Extract data updates and simulation results from tool calls
    let updatedData = { ...currentData };
    let simulationResult: RegimeComparison | undefined = undefined;

    // Parse all messages for tool calls and results
    for (const msg of result.messages) {
      // Check if message is AIMessage with tool_calls
      if (
        msg instanceof AIMessage &&
        msg.tool_calls &&
        msg.tool_calls.length > 0
      ) {
        for (const toolCall of msg.tool_calls) {
          logger.info({
            msg: '[ReAct Agent] Tool call detected',
            toolName: toolCall.name,
            toolCallId: toolCall.id,
          });

          // Find corresponding tool result message
          const toolMsgIndex = result.messages.findIndex(
            (m) => 'tool_call_id' in m && m.tool_call_id === toolCall.id
          );

          if (toolMsgIndex !== -1) {
            const toolMsg = result.messages[toolMsgIndex];

            // Tool results are now structured objects, not JSON strings
            const toolResult =
              typeof toolMsg.content === 'string'
                ? JSON.parse(toolMsg.content)
                : toolMsg.content;

            logger.info({
              msg: '[ReAct Agent] Tool result processed',
              toolName: toolCall.name,
              success: toolResult.success,
            });

            // Extract data updates from update_simulation_data tool
            if (
              toolCall.name === 'update_simulation_data' &&
              toolResult.success
            ) {
              updatedData = { ...updatedData, ...toolResult.data };
              logger.info({
                msg: '[ReAct Agent] Data updated',
                updatedFields: toolResult.updatedFields,
              });
            }

            // Extract simulation result from calculate tool
            if (
              toolCall.name === 'calculate_lmnp_simulation' &&
              toolResult.success
            ) {
              simulationResult = toolResult.result;
              logger.info({
                msg: '[ReAct Agent] Simulation calculated',
                recommendedRegime: simulationResult?.recommendedRegime,
              });
            }
          }
        }
      }
    }

    return {
      message: finalMessage as string,
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
