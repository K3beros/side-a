import type { FastifyInstance } from 'fastify';
import { reactionSchema, commentSchema } from './songs.schema.js';
import { listSongs, toggleReaction, addComment } from './songs.service.js';

export async function songRoutes(app: FastifyInstance): Promise<void> {
  app.get('/songs', async () => {
    const songs = await listSongs();
    return { songs };
  });

  app.post('/songs/:id/reactions', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = reactionSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    const fp = (request.headers['x-fingerprint'] as string) ?? parsed.data.fingerprint;
    const song = await toggleReaction(id, parsed.data.kind, fp);
    return { song };
  });

  app.post('/songs/:id/comments', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = commentSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    const comment = await addComment(id, parsed.data.who, parsed.data.text);
    return reply.status(201).send({ comment });
  });
}
