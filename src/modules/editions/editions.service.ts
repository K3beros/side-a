import { sql } from '../../db/index.js';

export type EditionRow = {
  id: string;
  idx: number;
  album: string;
  artist: string;
  date: string;
  venue: string;
  price: number;
  capacity: number;
  spots_sold: number;
  status: string;
  attendance: number | null;
  tix_africa_url: string | null;
  tix_africa_event_id: string | null;
  name: string;
  kind: string;
  meta: Record<string, unknown> | null;
};

export async function listEditions(opts: { kind?: string | undefined; status?: string | undefined; page: number; limit: number }): Promise<{
  editions: (EditionRow & { spotsLeft: number })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const where: string[] = [];
  const params: unknown[] = [];
  // Build dynamic where for sql template — use conditional branches for postgres.js typing
  const kind = opts.kind;
  const status = opts.status;
  const limit = opts.limit;
  const offset = (opts.page - 1) * limit;

  let totalRows: { count: string | number }[];
  let rows: EditionRow[];

  if (kind && status) {
    totalRows = await sql<{ count: string | number }[]>`select count(*) as count from editions where kind = ${kind} and status = ${status}`;
    rows = await sql<EditionRow[]>`select id, idx, album, artist, date, venue, price, capacity, spots_sold, status, attendance, tix_africa_url, tix_africa_event_id, name, kind, meta from editions where kind = ${kind} and status = ${status} order by idx asc limit ${limit} offset ${offset}`;
  } else if (kind) {
    totalRows = await sql<{ count: string | number }[]>`select count(*) as count from editions where kind = ${kind}`;
    rows = await sql<EditionRow[]>`select id, idx, album, artist, date, venue, price, capacity, spots_sold, status, attendance, tix_africa_url, tix_africa_event_id, name, kind, meta from editions where kind = ${kind} order by idx asc limit ${limit} offset ${offset}`;
  } else if (status) {
    totalRows = await sql<{ count: string | number }[]>`select count(*) as count from editions where status = ${status}`;
    rows = await sql<EditionRow[]>`select id, idx, album, artist, date, venue, price, capacity, spots_sold, status, attendance, tix_africa_url, tix_africa_event_id, name, kind, meta from editions where status = ${status} order by idx asc limit ${limit} offset ${offset}`;
  } else {
    totalRows = await sql<{ count: string | number }[]>`select count(*) as count from editions`;
    rows = await sql<EditionRow[]>`select id, idx, album, artist, date, venue, price, capacity, spots_sold, status, attendance, tix_africa_url, tix_africa_event_id, name, kind, meta from editions order by idx asc limit ${limit} offset ${offset}`;
  }

  const total = Number((totalRows[0] as { count: string | number }).count);
  const editions = rows.map((r) => ({ ...r, spotsLeft: r.capacity - r.spots_sold }));
  return { editions, total, page: opts.page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function syncEditionSpotsSold(id: string, spotsSold: number): Promise<EditionRow & { spotsLeft: number }> {
  const rows = await sql<EditionRow[]>`
    update editions
    set spots_sold = least(capacity, ${spotsSold})
    where id = ${id}
    returning id, idx, album, artist, date, venue, price, capacity, spots_sold, status, attendance, tix_africa_url, tix_africa_event_id, name, kind, meta
  `;
  if (rows.length === 0) throw new Error('Edition not found');
  const r = rows[0] as EditionRow;
  return { ...r, spotsLeft: r.capacity - r.spots_sold };
}

export async function incrementEditionSoldByEventId(eventId: string, qty: number): Promise<void> {
  await sql`
    update editions
    set spots_sold = least(capacity, spots_sold + ${qty})
    where tix_africa_event_id = ${eventId}
  `;
}
