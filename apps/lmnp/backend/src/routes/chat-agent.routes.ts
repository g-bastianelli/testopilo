/**
 * Chat Agent route - POST /chat-agent
 * Uses ReAct Agent: Single autonomous agent with tool calling
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { logger } from '@utils/logger';
import { ChatRequestSchema, ChatResponseSchema } from '@lmnp/shared';
import { runLmnpAgent } from '@lmnp/ai';

const chatAgent = new Hono();

chatAgent.post('/', zValidator('json', ChatRequestSchema), async (c) => {
  try {
    const { messages, currentData } = c.req.valid('json');

    logger.info({
      msg: '[Chat Agent] Request received, invoking ReAct agent',
      messagesCount: messages.length,
    });

    // Execute the ReAct agent
    const result = await runLmnpAgent(messages, currentData);

    logger.info({
      msg: '[Chat Agent] Agent completed',
      hasSimulationResult: !!result.simulationResult,
    });

    // Build response
    const response = {
      message: result.message,
      updatedData: result.updatedData,
      simulationResult: result.simulationResult,
    };

    const validatedResponse = ChatResponseSchema.parse(response);
    return c.json(validatedResponse);
  } catch (err) {
    logger.error({ msg: '[Chat Agent] Error', err });
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
});

export default chatAgent;
