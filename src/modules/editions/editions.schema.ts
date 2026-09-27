import { z } from 'zod';

export const syncEditionSchema = z.object({
  spotsSold: z.number().int().min(0),
});

export type SyncEditionInput = z.infer<typeof syncEditionSchema>;

export const listEditionsQuerySchema = z.object({
  kind: z.enum(['physical', 'virtual']).optional(),
  status: z.enum(['upcoming', 'past']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(5).default(5),
});
