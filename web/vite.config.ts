import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Dev-only fallback for BrowserRouter deep links (Vite MPA disables the
// default SPA fallback). Mirrors the backend webFallback contract:
// /admin* -> admin.html, everything else (non-file, non-api) -> index.html.
function mpaBrowserFallback(): Plugin {
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

export default defineConfig({
  plugins: [react(), mpaBrowserFallback()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
