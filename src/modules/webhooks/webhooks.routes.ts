import type { FastifyInstance } from 'fastify';
import { incrementEditionSoldByEventId } from '../editions/editions.service.js';
import { sql } from '../../db/index.js';

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  // Tix Africa — expects { eventId, quantity } or { tix_africa_event_id, qty }
  app.post('/webhooks/tix-africa', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const eventId = (body.eventId ?? body.tix_africa_event_id ?? body.event_id) as string | undefined;
    const qtyRaw = (body.quantity ?? body.qty ?? body.tickets ?? 1) as number | string;
    const qty = Number(qtyRaw);
    if (!eventId || Number.isNaN(qty)) {
      app.log.warn({ body }, 'tix-africa webhook: missing eventId/qty');
      return reply.status(200).send({ received: true, note: 'logged, no update applied' });
    }
    await incrementEditionSoldByEventId(eventId, qty);
    return { received: true, updated: { eventId, qty } };
  });

  // Monnify — expects { reference, paid }
  app.post('/webhooks/monnify', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const reference = (body.reference ?? body.paymentReference ?? body.payment_ref) as string | undefined;
    const paid = body.paid ? true : body.status === 'paid' || body.status === 'SUCCESS';
    if (!reference) {
      app.log.warn({ body }, 'monnify webhook: missing reference');
      return reply.status(200).send({ received: true });
    }
    if (paid) {
      const orders = await sql<{ items: { sku: string; qty: number }[] }[]>`
        select items from merch_orders where id = ${reference}
      `;
      if (orders.length > 0) {
        await sql`update merch_orders set status = 'paid' where id = ${reference}`;
        const items = (orders[0] as { items: { sku: string; qty: number }[] }).items;
        for (const it of items) {
          await sql`
            update merch_items set sold = least(coalesce(stock, 2147483647), sold + ${it.qty})
            where sku = ${it.sku}
          `;
        }
      }
    }
    return { received: true };
  });
}
