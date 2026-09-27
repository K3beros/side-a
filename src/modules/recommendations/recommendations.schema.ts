import { z } from 'zod';

export const createRecommendationSchema = z.object({
  name: z.string().min(1, 'Enter your name'),
  track: z.string().min(1, 'Enter a song or album'),
  why: z.string().min(1, 'Tell us why it fits'),
  link: z.string().url().optional().or(z.literal('')),
});

export type CreateRecommendationInput = z.infer<typeof createRecommendationSchema>;
