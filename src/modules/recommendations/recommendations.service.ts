import { sql } from '../../db/index.js';

export async function createRecommendation(data: { name: string; track: string; why: string; link?: string | undefined }): Promise<{ id: string }> {
  const link = data.link && data.link.trim() !== '' ? data.link : null;
  const rows = await sql<{ id: string }[]>`
    insert into recommendations (name, track, why, link) values (${data.name}, ${data.track}, ${data.why}, ${link})
    returning id
  `;
  return rows[0] as { id: string };
}
