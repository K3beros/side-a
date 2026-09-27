import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import type { BoardEntry, EditionsPage, HomeData, MerchItem } from '../../lib/types.js';

export function DashboardPage(): React.ReactElement {
  const [home, setHome] = useState<HomeData | null>(null);
  const [boardCount, setBoardCount] = useState(0);
  const [editionsCount, setEditionsCount] = useState(0);
  const [upcoming, setUpcoming] = useState<EditionsPage['editions'][number] | null>(null);
  const [merchRemaining, setMerchRemaining] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      api<HomeData>('/api/home'),
      api<{ board: BoardEntry[] }>('/api/board'),
      api<EditionsPage>('/api/editions'),
      api<{ items: MerchItem[] }>('/api/merch'),
    ]).then(([h, b, e, m]) => {
      if (cancelled) return;
      setHome(h.body ?? null);
      setBoardCount(b.body?.board?.length ?? 0);
      const editions = e.body?.editions ?? [];
      setEditionsCount(editions.length);
      setUpcoming(editions.find((x) => x.status === 'upcoming') ?? null);
      setMerchRemaining((m.body?.items ?? []).reduce((a, x) => a + (x.remaining === null ? 0 : x.remaining), 0));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="screen active">
      <p className="eyebrow">Side A Lagos — operations</p>
      <h2 className="section-title">Dashboard</h2>
      <p className="lede">Live snapshot of what the public sees. All inventory is mirrored here.</p>
      <div className="admin-grid">
        <div className="card">
          <p className="stat-value">{boardCount}</p>
          <p className="stat-label">Board queued (top 12)</p>
        </div>
        <div className="card">
          <p className="stat-value">{upcoming ? `${upcoming.spotsLeft}/${upcoming.capacity}` : '—'}</p>
          <p className="stat-label">Next edition spots left</p>
        </div>
        <div className="card">
          <p className="stat-value">{merchRemaining}</p>
          <p className="stat-label">Merch remaining (in-stock)</p>
        </div>
        <div className="card">
          <p className="stat-value">{editionsCount}</p>
          <p className="stat-label">Editions total</p>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <p className="panel-label">Live</p>
        {home?.nowSpinning ? (
          <div className="card" style={{ marginTop: 8 }}>
            <p style={{ fontFamily: 'Fraunces,serif', fontSize: 17 }}>
              {home.nowSpinning.title} — {home.nowSpinning.artist}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              Picked by {home.nowSpinning.picked_by}
            </p>
          </div>
        ) : null}
        {home?.nextEdition ? (
          <div className="card" style={{ marginTop: 12 }}>
            <p className="panel-label">Next edition</p>
            <p style={{ fontFamily: 'Fraunces, serif' }}>
              {home.nextEdition.name || home.nextEdition.album}{' '}
              <span className="kind-badge">{home.nextEdition.kind || 'physical'}</span>
            </p>
            <p style={{ color: 'var(--cream-dim)', fontSize: 13.5, marginTop: 6 }}>
              {home.nextEdition.venue} · {home.nextEdition.spotsLeft}/{home.nextEdition.capacity} left
              {home.nextEdition.tix_africa_url ? (
                <>
                  {' '}
                  ·{' '}
                  <a href={home.nextEdition.tix_africa_url} target="_blank" rel="noopener noreferrer">
                    Tix Africa
                  </a>
                </>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
