import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { mpaBrowserFallback } from './vite.shared.js';

// Admin-only entry (admin.html). Used by the side-a-admin Vercel project.
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
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
