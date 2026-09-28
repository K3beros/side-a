import type { Plugin } from 'vite';

// Shared dev-only fallback for BrowserRouter deep links (Vite MPA disables the
// default SPA fallback). Used by all three vite configs; mirrors the backend
// webFallback contract: /admin* -> admin.html, else -> index.html.
export function mpaBrowserFallback(): Plugin {
  return {
    name: 'side-a-mpa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '/').split('?')[0] ?? '/';
        if (
          url.startsWith('/api') ||
          url.startsWith('/health') ||
          url.startsWith('/assets') ||
          url.startsWith('/@vite') ||
          url.startsWith('/@react-refresh') ||
          url.startsWith('/src') ||
          url.startsWith('/node_modules') ||
          /\.[a-zA-Z0-9]+$/.test(url)
        ) {
          next();
          return;
        }
        req.url = url.startsWith('/admin') ? '/admin.html' : '/index.html';
        next();
      });
    },
  };
}
