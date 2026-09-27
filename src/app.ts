import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config, allowedOrigins } from './config.js';
import { sql } from './db/index.js';
import { errorHandler } from './lib/errors.js';
import { loggerOptions } from './lib/logger.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { editionRoutes } from './modules/editions/editions.routes.js';
import { merchRoutes } from './modules/merch/merch.routes.js';
import { songRoutes } from './modules/songs/songs.routes.js';
import { recommendationRoutes } from './modules/recommendations/recommendations.routes.js';
import { updateRoutes } from './modules/updates/updates.routes.js';
import { homeRoutes } from './modules/home/home.routes.js';
import { webhookRoutes } from './modules/webhooks/webhooks.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { boardRoutes } from './modules/recommendations/board.routes.js';
import { registerWebFallback } from './plugins/webFallback.js';

export function buildApp() {
  const app = Fastify({
    logger: loggerOptions(config.NODE_ENV !== 'production'),
  });

  app.setErrorHandler(errorHandler);

  // CORS — origins from env or undefined (no CORS in production until configured)
  const origins = allowedOrigins();
  void app.register(cors, {
    origin: origins ?? true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.addHook('onClose', async () => {
    await sql.end();
    app.log.info('postgres pool closed');
  });

  // Health — no prefix (for load balancers) + /api prefix
  app.get('/health', async () => ({ status: 'ok' as const }));
  void app.register(healthRoutes, { prefix: '/api' });
  void app.register(editionRoutes, { prefix: '/api' });
  void app.register(merchRoutes, { prefix: '/api' });
  void app.register(songRoutes, { prefix: '/api' });
  void app.register(recommendationRoutes, { prefix: '/api' });
  void app.register(updateRoutes, { prefix: '/api' });
  void app.register(homeRoutes, { prefix: '/api' });
  void app.register(webhookRoutes, { prefix: '/api' });
  void app.register(adminRoutes, { prefix: '/api' });
  void app.register(boardRoutes, { prefix: '/api' });

  // Static web + BrowserRouter fallback (no-op unless web/dist exists + enabled).
  registerWebFallback(app);

  return app;
}

export type App = ReturnType<typeof buildApp>;
