import type { FastifyInstance } from 'fastify';
import { getHome } from './home.service.js';

export async function homeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/home', async () => getHome());
}
