import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireGoogleUser } from '../../plugins/googleAuth.js';
import { listBoard, voteOnRecommendation } from './board.service.js';

export async function boardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/board', async () => {
    const board = await listBoard(12);
    return { board };
  });

  app.post(
    '/board/:id/vote',
    { preHandler: [requireGoogleUser] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = z.object({ direction: z.enum(['up', 'down']) }).safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
      const userId = request.googleUser!.googleId;
      try {
        const entry = await voteOnRecommendation(id, userId, parsed.data.direction);
        return { entry };
      } catch (e) {
        const err = e as Error & { statusCode?: number };
        return reply.status(err.statusCode ?? 500).send({ error: err.message });
      }
    },
  );
}
