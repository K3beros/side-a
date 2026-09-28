import { sql } from '../../db/index.js';
import { config } from '../../config.js';

export type MerchRow = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number | null;
  sold: number;
  status: string;
  note: string;
  size_options: string[] | null;
  monnify_base_url: string | null;
  is_published: boolean;
};

export async function listMerch(opts?: { publishedOnly?: boolean }): Promise<
  (MerchRow & { remaining: number | null })[]
> {
  const rows =
    opts?.publishedOnly === true
      ? await sql<MerchRow[]>`
          select id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
          from merch_items where is_published = true order by sku asc
        `
      : await sql<MerchRow[]>`
          select id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
          from merch_items order by sku asc
        `;
  return rows.map((r) => ({ ...r, remaining: r.stock === null ? null : r.stock - r.sold }));
}

export async function createMerch(data: {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock?: number | null;
  status: string;
  note: string;
  size_options?: string[] | null;
  monnify_base_url?: string | null;
}): Promise<MerchRow & { remaining: number | null }> {
  const rows = await sql<MerchRow[]>`
    insert into merch_items (sku, name, description, price, stock, status, note, size_options, monnify_base_url, is_published)
    values (${data.sku}, ${data.name}, ${data.description}, ${data.price}, ${data.stock ?? null}, ${data.status}, ${data.note}, ${data.size_options ? sql.json(data.size_options as never) : null}, ${data.monnify_base_url ?? null}, false)
    returning id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
  `;
  const r = rows[0] as MerchRow;
  return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
}

export async function updateMerch(
  id: string,
  data: Partial<{
    sku: string | undefined;
    name: string | undefined;
    description: string | undefined;
    price: number | undefined;
    stock: number | null | undefined;
    status: string | undefined;
    note: string | undefined;
    size_options: string[] | null | undefined;
    monnify_base_url: string | null | undefined;
  }>,
): Promise<MerchRow & { remaining: number | null }> {
  const existing = await sql<MerchRow[]>`
    select id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
    from merch_items where id = ${id}
  `;
  if (existing.length === 0) throw new Error('Not found');
  if (data.sku !== undefined) await sql`update merch_items set sku = ${data.sku} where id = ${id}`;
  if (data.name !== undefined) await sql`update merch_items set name = ${data.name} where id = ${id}`;
  if (data.description !== undefined)
    await sql`update merch_items set description = ${data.description} where id = ${id}`;
  if (data.price !== undefined) await sql`update merch_items set price = ${data.price} where id = ${id}`;
  if (data.stock !== undefined) await sql`update merch_items set stock = ${data.stock} where id = ${id}`;
  if (data.status !== undefined) await sql`update merch_items set status = ${data.status} where id = ${id}`;
  if (data.note !== undefined) await sql`update merch_items set note = ${data.note} where id = ${id}`;
  if (data.size_options !== undefined)
    await sql`update merch_items set size_options = ${data.size_options ? sql.json(data.size_options as never) : null} where id = ${id}`;
  if (data.monnify_base_url !== undefined)
    await sql`update merch_items set monnify_base_url = ${data.monnify_base_url} where id = ${id}`;
  const rows = await sql<MerchRow[]>`
    select id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
    from merch_items where id = ${id}
  `;
  const r = rows[0] as MerchRow;
  return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
}

export async function toggleMerchPublish(
  id: string,
  isPublished: boolean,
): Promise<MerchRow & { remaining: number | null }> {
  const rows = await sql<MerchRow[]>`
    update merch_items set is_published = ${isPublished} where id = ${id}
    returning id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
  `;
  if (rows.length === 0) throw new Error('Not found');
  const r = rows[0] as MerchRow;
  return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
}

export async function deleteMerch(id: string): Promise<void> {
  await sql`delete from merch_items where id = ${id}`;
}

export async function createMerchOrder(items: { sku: string; qty: number; size?: string | undefined }[]): Promise<{
  id: string;
  total: number;
  monnifyLink: string | null;
  items: typeof items;
}> {
  const merch = await listMerch({ publishedOnly: true });
  const bySku = new Map(merch.map((m) => [m.sku, m]));
  let total = 0;
  for (const it of items) {
    const m = bySku.get(it.sku);
    if (!m) throw new Error(`Unknown sku: ${it.sku}`);
    total += m.price * it.qty;
  }

  const base = config.MONNIFY_PAYMENT_BASE_URL ?? null;
  // Insert order; monnifyLink built after insert so we have id for reference
  const rows = await sql<{ id: string }[]>`
    insert into merch_orders (items, total, status)
    values (${sql.json(items)}, ${total}, 'pending')
    returning id
  `;
  const id = (rows[0] as { id: string }).id;
  let monnifyLink: string | null = null;
  if (base) {
    const url = new URL(base);
    url.searchParams.set('amount', String(total));
    url.searchParams.set('reference', id);
    monnifyLink = url.toString();
    await sql`update merch_orders set monnify_link = ${monnifyLink}, payment_ref = ${id} where id = ${id}`;
  }

  return { id, total, monnifyLink, items };
}

export async function syncMerchSold(
  sku: string,
  sold?: number,
  delta?: number,
): Promise<MerchRow & { remaining: number | null }> {
  if (sold !== undefined) {
    const rows = await sql<MerchRow[]>`
      update merch_items set sold = least(coalesce(stock, 2147483647), ${sold})
      where sku = ${sku}
      returning id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
    `;
    if (rows.length === 0) throw new Error('SKU not found');
    const r = rows[0] as MerchRow;
    return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
  }
  if (delta !== undefined) {
    const rows = await sql<MerchRow[]>`
      update merch_items set sold = least(coalesce(stock, 2147483647), sold + ${delta})
      where sku = ${sku}
      returning id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url, is_published
    `;
    if (rows.length === 0) throw new Error('SKU not found');
    const r = rows[0] as MerchRow;
    return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
  }
  throw new Error('Provide sold or delta');
}
