import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { syncEditionSchema } from '../editions/editions.schema.js';
import { syncEditionSpotsSold } from '../editions/editions.service.js';
import { syncMerchSold } from '../merch/merch.service.js';
import { syncMerchSchema } from '../merch/merch.schema.js';
import { pickBoardEntry } from '../recommendations/board.service.js';
import { sql } from '../../db/index.js';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.post('/admin/sync/editions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = syncEditionSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    try {
      const edition = await syncEditionSpotsSold(id, parsed.data.spotsSold);
      return { edition };
    } catch (e) {
      return reply.status(404).send({ error: 'NotFound', message: (e as Error).message });
    }
  });

  app.post('/admin/sync/merch', async (request, reply) => {
    const parsed = syncMerchSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    try {
      const item = await syncMerchSold(parsed.data.sku, parsed.data.sold, parsed.data.delta);
      return { item };
    } catch (e) {
      return reply.status(404).send({ error: 'NotFound', message: (e as Error).message });
    }
  });

  // Board: stakeholder picks any entry — closes the week (picked + all other queued -> archived)
  app.post('/admin/board/pick', async (request, reply) => {
    const { id } = (request.body as { id?: string }) ?? {};
    if (!id) return reply.status(400).send({ error: 'ValidationError', message: 'id required' });
    try {
      const res = await pickBoardEntry(id);
      return res;
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  app.get('/admin/board', async () => {
    const board = await sql`select id, name, track, why, link, upvotes, downvotes, score, status, created_at from recommendations where status = 'queued' order by score desc, created_at asc limit 12`;
    return { board };
  });

  // Editions CRUD — name/kind/meta; idx auto (hybrid: display sequential, linked by uuid)
  const editionCreateSchema = z.object({
    name: z.string().min(1),
    kind: z.enum(['physical', 'virtual']).default('physical'),
    album: z.string().min(1),
    artist: z.string().min(1),
    date: z.string().min(1),
    venue: z.string().min(1),
    price: z.number().int().min(0).default(0),
    capacity: z.number().int().positive(),
    status: z.enum(['upcoming', 'past']).default('upcoming'),
    tix_africa_url: z.string().url().optional().or(z.literal('')),
    tix_africa_event_id: z.string().optional().or(z.literal('')),
    meta: z.record(z.string(), z.unknown()).nullable().optional(),
  });

  app.post('/admin/editions', async (request, reply) => {
    const parsed = editionCreateSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    const d = parsed.data;
    try {
      // Advisory lock to serialize idx assignment (display sequential, linked by uuid)
      await sql`select pg_advisory_xact_lock(hashtext('editions_idx'))`;
      const maxRow = await sql<{ max: number | null }[]>`select max(idx) as max from editions`;
      const nextIdx = ((maxRow[0] as { max: number | null }).max ?? 0) + 1;
      const rows = await sql<{ id: string }[]>`
        insert into editions (idx, name, kind, album, artist, date, venue, price, capacity, status, tix_africa_url, tix_africa_event_id, meta)
        values (${nextIdx}, ${d.name}, ${d.kind}, ${d.album}, ${d.artist}, ${d.date}, ${d.venue}, ${d.price}, ${d.capacity}, ${d.status}, ${d.tix_africa_url || null}, ${d.tix_africa_event_id || null}, ${d.meta ? sql.json(d.meta as never) : null})
        returning id
      `;
      const id = (rows[0] as { id: string }).id;
      const edition = await sql`select id, idx, name, kind, album, artist, date, venue, price, capacity, spots_sold, status, tix_africa_url, tix_africa_event_id, meta from editions where id = ${id}`;
      return reply.status(201).send({ edition: edition[0] });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('duplicate') || msg.includes('unique')) return reply.status(409).send({ error: 'Conflict', message: msg });
      return reply.status(500).send({ error: msg });
    }
  });

  app.patch('/admin/editions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = editionCreateSchema.partial().safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    const d = parsed.data;
    const fields: string[] = [];
    const values: unknown[] = [];
    // Build dynamic update via sql helper
    const existing = await sql`select id from editions where id = ${id}`;
    if (existing.length === 0) return reply.status(404).send({ error: 'NotFound' });
    // Use json_build approach: update only provided fields
    if (d.name !== undefined) await sql`update editions set name = ${d.name} where id = ${id}`;
    if (d.kind !== undefined) await sql`update editions set kind = ${d.kind} where id = ${id}`;
    if (d.album !== undefined) await sql`update editions set album = ${d.album} where id = ${id}`;
    if (d.artist !== undefined) await sql`update editions set artist = ${d.artist} where id = ${id}`;
    if (d.date !== undefined) await sql`update editions set date = ${d.date} where id = ${id}`;
    if (d.venue !== undefined) await sql`update editions set venue = ${d.venue} where id = ${id}`;
    if (d.price !== undefined) await sql`update editions set price = ${d.price} where id = ${id}`;
    if (d.capacity !== undefined) await sql`update editions set capacity = ${d.capacity} where id = ${id}`;
    if (d.status !== undefined) await sql`update editions set status = ${d.status} where id = ${id}`;
    if (d.tix_africa_url !== undefined) await sql`update editions set tix_africa_url = ${d.tix_africa_url || null} where id = ${id}`;
    if (d.tix_africa_event_id !== undefined) await sql`update editions set tix_africa_event_id = ${d.tix_africa_event_id || null} where id = ${id}`;
    if (d.meta !== undefined) await sql`update editions set meta = ${d.meta ? sql.json(d.meta as never) : null} where id = ${id}`;
    void fields; void values;
    const rows = await sql`select id, idx, name, kind, album, artist, date, venue, price, capacity, spots_sold, status, tix_africa_url, tix_africa_event_id, meta from editions where id = ${id}`;
    return { edition: rows[0] };
  });

  // Merch orders list (admin)
  app.get('/admin/merch/orders', async () => {
    const orders = await sql`select id, items, total, monnify_link, payment_ref, status, created_at from merch_orders order by created_at desc limit 50`;
    return { orders };
  });
}
