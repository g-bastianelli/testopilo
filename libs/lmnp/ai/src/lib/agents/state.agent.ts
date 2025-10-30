/**
 * Workflow for LMNP Chat with AI SDK
 * Architecture: Extract → Calculate → Explain
 */

import { logger } from '@utils/logger';
import {
  type ChatMessage,
  type SimulationData,
  type RegimeComparison,
  CompleteSimulationDataSchema,
} from '@lmnp/shared';
import { extractNode } from './nodes/extract.node.js';
import { calculateNode } from './nodes/calculate.node.js';
import { explainNode } from './nodes/explain.node.js';

/**
 * State for the chat workflow
 */
interface ChatWorkflowState {
  messages: ChatMessage[];
  currentData: SimulationData;
  updatedData?: SimulationData;
  extractionMessage?: string;
  calculationResult?: RegimeComparison;
  finalMessage?: string;
  simulationResult?: RegimeComparison;
}

/**
 * Run the chat workflow manually
 */
export async function runChatWorkflow(
  messages: ChatMessage[],
  currentData: SimulationData
): Promise<{
  message: string;
  updatedData: SimulationData;
  simulationResult?: RegimeComparison;
}> {
  logger.info({ msg: '[Workflow] Starting chat workflow' });

  // Initialize state
  const state: ChatWorkflowState = {
    messages,
    currentData,
  };

  // Step 1: Extract
  logger.info({ msg: '[Workflow] Running extract node' });
  const extractResult = await extractNode({
    messages: state.messages,
    currentData: state.currentData,
  });
  state.updatedData = extractResult.updatedData;
  state.extractionMessage = extractResult.extractionMessage;

  // Step 2: Check if data is complete
  const validate = CompleteSimulationDataSchema.safeParse(state.updatedData);

  if (!validate.success) {
    logger.info({ msg: '[Workflow] Data incomplete, ending workflow' });
    return {
      message: state.extractionMessage || '',
      updatedData: state.updatedData,
    };
  }

  // Step 3: Calculate
  logger.info({ msg: '[Workflow] Data complete, running calculate node' });
  const calculateResult = await calculateNode({
    updatedData: validate.data,
  });
  state.calculationResult = calculateResult.calculationResult;

  // Step 4: Explain
  logger.info({ msg: '[Workflow] Running explain node' });
  const explainResult = await explainNode({
    updatedData: state.updatedData,
    calculationResult: state.calculationResult,
    extractionMessage: state.extractionMessage,
  });
  state.finalMessage = explainResult.finalMessage;
  state.simulationResult = explainResult.simulationResult;

  logger.info({ msg: '[Workflow] Workflow complete' });

  return {
    message: state.finalMessage || '',
    updatedData: state.updatedData,
    simulationResult: state.simulationResult,
  };
}
