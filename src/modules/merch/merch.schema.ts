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

export const createMerchSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).nullable().optional(),
  status: z.string().min(1),
  note: z.string().min(1),
  size_options: z.array(z.string()).nullable().optional(),
  monnify_base_url: z.string().url().nullable().optional().or(z.literal('')),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
