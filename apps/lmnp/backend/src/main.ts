import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from '@testopilo/logger';

const app = new Hono();
app.get('/', (c) => c.text('Hello Node.js!'));

const port = process.env.PORT || 3000;

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
