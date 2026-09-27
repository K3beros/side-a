import type { FastifyInstance } from 'fastify';
import { createOrderSchema } from './merch.schema.js';
import { listMerch, createMerchOrder } from './merch.service.js';

export async function merchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/merch', async () => {
    const items = await listMerch();
    return { items };
  });

  app.post('/merch/orders', async (request, reply) => {
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'ValidationError', issues: parsed.error.issues });
    }
    const order = await createMerchOrder(parsed.data.items);
    return reply.status(201).send(order);
  });
}
