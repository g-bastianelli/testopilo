/**
 * Chat route - POST /chat
 * Uses LangGraph workflow: Extract → Calculate → Explain
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { logger } from '@utils/logger';
import { ChatRequestSchema, ChatResponseSchema } from '@lmnp/shared';
import { runChatWorkflow } from '@lmnp/ai';

const chat = new Hono();

chat.post('/', zValidator('json', ChatRequestSchema), async (c) => {
  try {
    const { messages, currentData } = c.req.valid('json');

    logger.info({
      msg: '[Chat] Request received, invoking LangGraph workflow',
      messagesCount: messages.length,
    });

    // Execute the LangGraph workflow
    const result = await runChatWorkflow(messages, currentData);

    logger.info({
      msg: '[Chat] Workflow completed',
      hasSimulationResult: !!result.simulationResult,
    });

    // Build response from workflow result
    const response = {
      message: result.message,
      updatedData: result.updatedData || currentData,
      simulationResult: result.simulationResult,
    };

    const validatedResponse = ChatResponseSchema.parse(response);
    return c.json(validatedResponse);
  } catch (err) {
    logger.error({ msg: '[Chat] Workflow error', err });
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
});

export default chat;
