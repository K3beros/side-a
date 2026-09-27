import { createBrowserRouter, RouterProvider } from 'react-router';
import { PublicShell } from './layout.js';
import { HomePage } from './pages/Home.js';
import { EditionsPage } from './pages/Editions.js';
import { SongPage } from './pages/Song.js';
import { SubmitPage } from './pages/Submit.js';
import { MerchPage } from './pages/Merch.js';
import { UpdatesPage } from './pages/Updates.js';

function NotFound(): React.ReactElement {
  return (
    <section className="screen active">
      <h2 className="section-title">Not found</h2>
      <p className="lede">That page doesn&apos;t exist.</p>
    </section>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicShell />,
    errorElement: <PublicShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'editions', element: <EditionsPage /> },
      { path: 'song', element: <SongPage /> },
      { path: 'submit', element: <SubmitPage /> },
      { path: 'merch', element: <MerchPage /> },
      { path: 'updates', element: <UpdatesPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function PublicRouter(): React.ReactElement {
  return <RouterProvider router={router} />;
}
