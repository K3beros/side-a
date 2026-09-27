import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';

const TABS = [
  { to: '', label: 'Dashboard', end: true },
  { to: 'editions', label: 'Editions' },
  { to: 'board', label: 'Board' },
  { to: 'merch', label: 'Merch' },
  { to: 'updates', label: 'Updates' },
  { to: 'webhooks', label: 'Webhooks' },
];

const LEGACY_TABS = ['dashboard', 'editions', 'board', 'merch', 'updates', 'webhooks'];

function LegacyHashRedirect(): null {
  const { hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const name = (hash || '').replace(/^#\/?/, '');
    if (LEGACY_TABS.includes(name)) {
      navigate(name === 'dashboard' ? '' : name, { replace: true });
    }
  }, [hash, navigate]);
  return null;
}

function ScrollToTop(): null {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname, search]);
  return null;
}

function isActiveTab(to: string, end: boolean | undefined, pathname: string): boolean {
  const base = '/admin';
  const full = to ? `${base}/${to}` : base;
  if (end) return pathname === base || pathname === `${base}/`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function AdminShell(): React.ReactElement {
  const { pathname } = useLocation();
  return (
    <>
      <LegacyHashRedirect />
      <ScrollToTop />
      <header className="top">
        <div className="top-inner">
          <div className="brand">
            Side A <em>Admin</em>
          </div>
          <nav className="tabs" id="admin-tabs" aria-label="Admin">
            {TABS.map((t) => (
              <Link key={t.label} to={t.to} aria-current={isActiveTab(t.to, t.end, pathname) ? 'page' : undefined}>
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="wrap">
        <Outlet />
        <footer className="foot">
          Side A Admin — same plum/gold system as public (`--plum-950`, `--gold`, Fraunces/Space Grotesk, 760px).
          Gateway deferred until pre-shipping.
        </footer>
      </div>
    </>
  );
}
