import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().min(1),
        qty: z.number().int().min(1).max(10),
        size: z.string().optional(),
      }),
    )
    .min(1),
});

export const syncMerchSchema = z.object({
  sku: z.string().min(1),
  sold: z.number().int().min(0).optional(),
  delta: z.number().int().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
