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
  { basename: '/admin' },
);

export function AdminRouter(): React.ReactElement {
  return <RouterProvider router={router} />;
}
