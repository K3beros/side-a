import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TIX_AFRICA_EVENT_ID: z.string().optional(),
  TIX_AFRICA_EVENT_URL: z.string().url().optional(),
  MONNIFY_PAYMENT_BASE_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  SERVE_WEB: z.coerce.boolean().optional().default(false),
  WEB_DIST: z.string().optional(),
  // Supabase PgBouncer (transaction mode, port 6543) rejects prepared statements.
  // Set PG_PREPARE=false when DATABASE_URL points at the pooler; leave unset for
  // direct Postgres connections (local dev, Supabase direct on 5432).
  PG_PREPARE: z.enum(['true', 'false']).optional().default('true'),
});

export type Config = z.infer<typeof envSchema>;

function loadConfig(): Config {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid env: ${details}`);
  }
  return parsed.data;
}

export const config: Config = loadConfig();

export function allowedOrigins(): string[] | undefined {
  if (!config.ALLOWED_ORIGINS) return undefined;
  return config.ALLOWED_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
