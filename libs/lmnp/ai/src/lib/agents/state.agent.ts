/**
 * LangGraph Workflow for LMNP Chat
 * Architecture: Extract → Calculate → Explain
 */

import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
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
 * State for the chat workflow using LangGraph Annotation API with reducers
 */
const ChatWorkflowState = Annotation.Root({
  // Input - messages accumulate over time
  messages: Annotation<ChatMessage[]>({
    reducer: (state, update) => state.concat(update),
    default: () => [],
  }),
  currentData: Annotation<SimulationData>,

  // Intermediate state
  updatedData: Annotation<SimulationData | undefined>,
  extractionMessage: Annotation<string | undefined>,
  calculationResult: Annotation<RegimeComparison | undefined>,

  // Output
  finalMessage: Annotation<string | undefined>,
  simulationResult: Annotation<RegimeComparison | undefined>,
});

/**
 * Conditional edge: Should we calculate?
 */
function shouldCalculate(state: typeof ChatWorkflowState.State): string {
  const validate = CompleteSimulationDataSchema.safeParse(state.updatedData);

  if (validate.success) {
    logger.info({ msg: '[LangGraph] Data complete, routing to calculate' });
    return 'calculate';
  }

  logger.info({ msg: '[LangGraph] Data incomplete, ending workflow' });
  return END;
}

/**
 * Create and compile the chat workflow graph
 */
export function createChatWorkflow() {
  const workflow = new StateGraph(ChatWorkflowState)

    // Add nodes
    .addNode('extract', extractNode)
    .addNode('calculate', calculateNode)
    .addNode('explain', explainNode)
    // Add edges
    .addEdge(START, 'extract')
    .addConditionalEdges('extract', shouldCalculate, {
      calculate: 'calculate',
      __end__: END,
    })
    .addEdge('calculate', 'explain')
    .addEdge('explain', END);

  return workflow.compile();
}
