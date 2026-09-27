import { sql } from '../../db/index.js';

export type UpdateRow = {
  id: string;
  date: string;
  title: string;
  description: string;
  source: string;
  source_url: string | null;
  meta: Record<string, unknown> | null;
};

export async function listUpdates(source?: string): Promise<UpdateRow[]> {
  if (source) {
    return await sql<UpdateRow[]>`select id, date, title, description, source, source_url, meta from updates where source = ${source} order by date desc`;
  }
  return await sql<UpdateRow[]>`select id, date, title, description, source, source_url, meta from updates order by date desc`;
}

export async function createUpdate(data: {
  date: string;
  title: string;
  description: string;
  source?: string | undefined;
  source_url?: string | null | undefined;
  meta?: Record<string, unknown> | null | undefined;
}): Promise<UpdateRow> {
  const rows = await sql<UpdateRow[]>`
    insert into updates (date, title, description, source, source_url, meta)
    values (${data.date}, ${data.title}, ${data.description}, ${data.source ?? 'side_a'}, ${data.source_url ?? null}, ${data.meta ? sql.json(data.meta as never) : null})
    returning id, date, title, description, source, source_url, meta
  `;
  return rows[0] as UpdateRow;
}

export async function updateUpdate(
  id: string,
  data: Partial<{ date: string; title: string; description: string; source: string; source_url: string | null; meta: Record<string, unknown> | null }>,
): Promise<UpdateRow> {
  const existing = await sql<UpdateRow[]>`select id, date, title, description, source, source_url, meta from updates where id = ${id}`;
  if (existing.length === 0) throw Object.assign(new Error('Not found'), { statusCode: 404 });
  const cur = existing[0] as UpdateRow;
  const next = {
    date: data.date ?? cur.date,
    title: data.title ?? cur.title,
    description: data.description ?? cur.description,
    source: data.source ?? cur.source,
    source_url: data.source_url !== undefined ? data.source_url : cur.source_url,
    meta: data.meta !== undefined ? data.meta : cur.meta,
  };
  const rows = await sql<UpdateRow[]>`
    update updates set date = ${next.date}, title = ${next.title}, description = ${next.description}, source = ${next.source}, source_url = ${next.source_url}, meta = ${next.meta ? sql.json(next.meta as never) : null}
    where id = ${id}
    returning id, date, title, description, source, source_url, meta
  `;
  return rows[0] as UpdateRow;
}

export async function deleteUpdate(id: string): Promise<void> {
  await sql`delete from updates where id = ${id}`;
}
