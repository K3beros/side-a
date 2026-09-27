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
};

export async function listMerch(): Promise<(MerchRow & { remaining: number | null })[]> {
  const rows = await sql<MerchRow[]>`
    select id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url
    from merch_items order by sku asc
  `;
  return rows.map((r) => ({ ...r, remaining: r.stock === null ? null : r.stock - r.sold }));
}

export async function createMerchOrder(items: { sku: string; qty: number; size?: string | undefined }[]): Promise<{
  id: string;
  total: number;
  monnifyLink: string | null;
  items: typeof items;
}> {
  const merch = await listMerch();
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

export async function syncMerchSold(sku: string, sold?: number, delta?: number): Promise<MerchRow & { remaining: number | null }> {
  if (sold !== undefined) {
    const rows = await sql<MerchRow[]>`
      update merch_items set sold = least(coalesce(stock, 2147483647), ${sold})
      where sku = ${sku}
      returning id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url
    `;
    if (rows.length === 0) throw new Error('SKU not found');
    const r = rows[0] as MerchRow;
    return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
  }
  if (delta !== undefined) {
    const rows = await sql<MerchRow[]>`
      update merch_items set sold = least(coalesce(stock, 2147483647), sold + ${delta})
      where sku = ${sku}
      returning id, sku, name, description, price, stock, sold, status, note, size_options, monnify_base_url
    `;
    if (rows.length === 0) throw new Error('SKU not found');
    const r = rows[0] as MerchRow;
    return { ...r, remaining: r.stock === null ? null : r.stock - r.sold };
  }
  throw new Error('Provide sold or delta');
}
