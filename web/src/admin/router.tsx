import { createBrowserRouter, RouterProvider } from 'react-router';
import { AdminShell } from './layout.js';
import { DashboardPage } from './pages/Dashboard.js';
import { EditionsManager } from './pages/Editions.js';
import { BoardManager } from './pages/Board.js';
import { MerchManager } from './pages/Merch.js';
import { UpdatesManager } from './pages/Updates.js';
import { WebhooksTester } from './pages/Webhooks.js';

function AdminNotFound(): React.ReactElement {
  return (
    <section className="screen active">
      <h2 className="section-title">Not found</h2>
      <p className="lede">That admin page doesn&apos;t exist.</p>
    </section>
  );
}

// Base path for admin routes. Default /admin (backend-served copy and local
// dev). The dedicated side-a-admin Vercel project serves at domain root, so
// it sets VITE_ADMIN_BASENAME=/ (normalized to '' below).
function adminBasename(): string {
  const raw = (import.meta.env.VITE_ADMIN_BASENAME ?? '/admin').trim();
  if (raw === '' || raw === '/') return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AdminShell />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'editions', element: <EditionsManager /> },
        { path: 'board', element: <BoardManager /> },
        { path: 'merch', element: <MerchManager /> },
        { path: 'updates', element: <UpdatesManager /> },
        { path: 'webhooks', element: <WebhooksTester /> },
        { path: '*', element: <AdminNotFound /> },
      ],
    },
  ],
  { basename: adminBasename() },
);

export function AdminRouter(): React.ReactElement {
  return <RouterProvider router={router} />;
}
