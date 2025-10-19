/**
 * Chat route - POST /chat
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { logger } from '@testopilo/logger';
import { ChatRequestSchema, ChatResponseSchema } from '@testopilo/lmnp-shared';
import { AiService } from '../services/ai.service.js';

const chat = new Hono();
const aiService = new AiService();

chat.post('/', zValidator('json', ChatRequestSchema), async (c) => {
  try {
    const { messages, currentData } = c.req.valid('json');

    logger.info({
      msg: 'Chat request received',
      messagesCount: messages.length,
    });

    const result = await aiService.chat(messages, currentData);

    // Validate response with Zod
    const validatedResponse = ChatResponseSchema.parse(result);

    return c.json(validatedResponse);
  } catch (err) {
    logger.error({ msg: 'Chat error', err });
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
});

export default chat;
