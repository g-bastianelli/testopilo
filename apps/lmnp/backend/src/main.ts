import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from '@utils/logger';
import { cors } from 'hono/cors';
import chat from './routes/chat.routes.js';
import chatAgent from './routes/chat-agent.routes.js';
import { env } from './config/env.js';

const app = new Hono();

// Middleware
app.use('/*', cors());

// Routes
app.get('/health', (c) =>
  c.json({ message: 'LMNP Backend API', version: env.VERSION })
);
app.route('/chat', chat); // LangGraph workflow approach
app.route('/chat-agent', chatAgent); // ReAct agent approach

const port = env.PORT;

logger.info({
  msg: `Server is running on port ${port}`,
});

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});

// graceful shutdown
process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      logger.error({
        msg: `Error closing server`,
        err,
      });
      process.exit(1);
    }
    process.exit(0);
  });
});
