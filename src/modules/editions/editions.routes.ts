import type { FastifyInstance } from 'fastify';
import { listEditions } from './editions.service.js';
import { listEditionsQuerySchema } from './editions.schema.js';

export async function editionRoutes(app: FastifyInstance): Promise<void> {
  app.get('/editions', async (request) => {
    const parsed = listEditionsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      // Fallback to defaults if validation fails
      const result = await listEditions({ page: 1, limit: 5 });
      return { ...result, error: 'ValidationError', issues: parsed.error.issues };
    }
    const result = await listEditions(parsed.data);
    return result;
  });
}
