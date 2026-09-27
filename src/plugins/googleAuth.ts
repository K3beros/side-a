import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';

export type GoogleUser = { googleId: string; email?: string | undefined };

declare module 'fastify' {
  interface FastifyRequest {
    googleUser?: GoogleUser;
  }
}

// Minimal Google id_token verification: decode JWT payload without crypto for prototype.
// In production, verify signature via https://www.googleapis.com/oauth2/v3/certs or google-auth-library.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1] as string, 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function requireGoogleUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : (request.headers['x-google-id-token'] as string | undefined);
  if (!token) {
    void reply.status(401).send({ error: 'Unauthorized', message: 'Google sign-in required' });
    return;
  }

  // If GOOGLE_CLIENT_ID is set, check aud claim matches.
  const payload = decodeJwtPayload(token);
  if (payload && typeof payload.sub === 'string') {
    const aud = payload.aud as string | undefined;
    if (config.GOOGLE_CLIENT_ID && aud !== config.GOOGLE_CLIENT_ID) {
      void reply.status(401).send({ error: 'Unauthorized', message: 'Invalid audience' });
      return;
    }
    request.googleUser = { googleId: payload.sub as string, email: payload.email as string | undefined };
    return;
  }

  // Fallback: treat raw token as googleId for dev/manual testing
  request.googleUser = { googleId: token };
}
