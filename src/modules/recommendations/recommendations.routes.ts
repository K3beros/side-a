import type { FastifyInstance } from 'fastify';
import { createRecommendationSchema } from './recommendations.schema.js';
import { createRecommendation } from './recommendations.service.js';

export async function recommendationRoutes(app: FastifyInstance): Promise<void> {
  app.post('/recommendations', async (request, reply) => {
    const parsed = createRecommendationSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    const rec = await createRecommendation(parsed.data);
    return reply.status(201).send(rec);
  });
}
