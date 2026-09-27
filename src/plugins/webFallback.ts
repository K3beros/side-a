import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { config } from '../config.js';

function resolveWebDist(): string | null {
  if (config.WEB_DIST) {
    const p = resolve(config.WEB_DIST);
    return existsSync(p) && existsSync(resolve(p, 'index.html')) ? p : null;
  }
  const here = dirname(fileURLToPath(import.meta.url));
  // candidates: <repo>/web/dist when running via tsx from src/, and
  // <repo>/web/dist when running compiled node dist/server.js (src -> dist)
  const candidates = [
    resolve(here, '../../web/dist'),
    resolve(here, '../web/dist'),
    resolve(process.cwd(), 'web/dist'),
  ];
  for (const c of candidates) {
    if (existsSync(c) && existsSync(resolve(c, 'index.html'))) return c;
  }
  return null;
}

export function registerWebFallback(app: FastifyInstance): void {
  const root = resolveWebDist();
  if (!root) return;
  // Only serve HTML fallback when explicitly enabled in production-like envs,
  // or when SERVE_WEB is set. Default dev (tsx watch, no dist intent) stays API-only
  // unless the operator opts in — rollback is SERVE_WEB=false.
  const enabled = config.SERVE_WEB || config.NODE_ENV === 'production';
  if (!enabled) return;

  void app.register(fastifyStatic, {
    root,
    prefix: '/',
    decorateReply: true,
    wildcard: false,
  });

  // Cache policy (applied in onSend because @fastify/static's `send` headers
  // would overwrite a `setHeaders` callback): hashed /assets/* immutable 1y,
  // HTML shells + SPA fallback no-cache so BrowserRouter refreshes never go stale.
  app.addHook('onSend', async (request, reply) => {
    const path = (request.raw.url ?? '/').split('?')[0] ?? '/';
    if (path.startsWith('/assets/')) {
      void reply.header('cache-control', 'public, max-age=31536000, immutable');
    } else if (path.endsWith('.html') || (!path.startsWith('/api/') && !path.includes('.'))) {
      void reply.header('cache-control', 'no-cache');
    }
  });

  // Note: no explicit /index.html or /admin.html redirect routes — @fastify/static
  // already serves those files and Fastify forbids duplicate GET routes.
  // BrowserRouter links never point at *.html, so canonical URLs stay clean.

  app.setNotFoundHandler((request, reply) => {
    const url = request.raw.url ?? '/';
    const path = url.split('?')[0] ?? '/';
    // API + health must stay JSON — never serve HTML for these (R1).
    if (path.startsWith('/api/') || path === '/api' || path === '/health' || path.startsWith('/health/')) {
      void reply.status(404).send({ error: 'NotFound', message: `Route ${request.method}:${path} not found` });
      return;
    }
    if (path === '/admin' || path.startsWith('/admin/')) {
      void reply.sendFile('admin.html');
      return;
    }
    void reply.sendFile('index.html');
  });
}
