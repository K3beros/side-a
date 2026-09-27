import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { post } from '../lib/api.js';
import type { CartLine } from '../lib/types.js';

export interface CartEntry {
  qty: number;
  price: number;
  size?: string;
}

interface CartContextValue {
  lines: Record<string, CartEntry>;
  setQty: (sku: string, qty: number, price: number, size?: string) => void;
  clear: () => void;
  count: number;
  total: number;
  placing: boolean;
  placeOrder: () => Promise<{ monnifyLink: string | null }>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [lines, setLines] = useState<Record<string, CartEntry>>({});
  const [placing, setPlacing] = useState(false);

  const setQty = useCallback((sku: string, qty: number, price: number, size?: string) => {
    setLines((prev) => {
      if (qty <= 0) {
        const { [sku]: _dropped, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sku]: { qty, price, size } };
    });
  }, []);

  const clear = useCallback(() => setLines({}), []);

  const { count, total } = useMemo(() => {
    let c = 0;
    let t = 0;
    for (const e of Object.values(lines)) {
      c += e.qty;
      t += e.qty * e.price;
    }
    return { count: c, total: t };
  }, [lines]);

  const placeOrder = useCallback(async () => {
    const items: CartLine[] = Object.entries(lines).map(([sku, e]) => ({
      sku,
      qty: e.qty,
      ...(e.size ? { size: e.size } : {}),
    }));
    if (items.length === 0) return { monnifyLink: null };
    setPlacing(true);
    try {
      const res = await post<{ monnifyLink: string | null }>('/api/merch/orders', { items });
      if (res.ok && res.body.monnifyLink) {
        window.location.href = res.body.monnifyLink;
        return { monnifyLink: res.body.monnifyLink };
      }
      return { monnifyLink: null };
    } finally {
      setPlacing(false);
    }
  }, [lines]);

  const value = useMemo(
    () => ({ lines, setQty, clear, count, total, placing, placeOrder }),
    [lines, setQty, clear, count, total, placing, placeOrder],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
