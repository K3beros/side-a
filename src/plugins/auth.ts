import type { FastifyInstance } from 'fastify';

// Placeholder — add JWT verification when auth is needed.
// Example:
//   app.decorate('authenticate', async (request, reply) => { ... })
//   app.addHook('onRequest', app.authenticate) on protected routes

export async function authPlugin(app: FastifyInstance): Promise<void> {
  app.decorate('authenticate', async () => {
    // no-op until implemented
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: () => Promise<void>;
  }
}
