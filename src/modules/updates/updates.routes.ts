import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listUpdates, createUpdate, updateUpdate, deleteUpdate } from './updates.service.js';
import { requireAdmin } from '../../plugins/googleAuth.js';

const updateSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  source: z.enum(['side_a', 'instagram', 'youtube', 'twitter_spaces', 'other']).optional(),
  source_url: z.string().url().optional().or(z.literal('')),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function updateRoutes(app: FastifyInstance): Promise<void> {
  app.get('/updates', async (request) => {
    const { source } = request.query as { source?: string };
    const updates = await listUpdates(source);
    return { updates };
  });

  app.post('/admin/updates', { preHandler: [requireAdmin] }, async (request, reply) => {
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    const u = await createUpdate({
      date: parsed.data.date,
      title: parsed.data.title,
      description: parsed.data.description,
      source: parsed.data.source,
      source_url: parsed.data.source_url || null,
      meta: parsed.data.meta,
    });
    return reply.status(201).send({ update: u });
  });

  app.patch('/admin/updates/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateSchema.partial().safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    try {
      const u = await updateUpdate(id, { ...parsed.data, source_url: parsed.data.source_url || null } as never);
      return { update: u };
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  app.delete('/admin/updates/:id', { preHandler: [requireAdmin] }, async (request) => {
    const { id } = request.params as { id: string };
    await deleteUpdate(id);
    return { ok: true };
  });
}
