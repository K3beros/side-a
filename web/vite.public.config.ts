import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { mpaBrowserFallback } from './vite.shared.js';

// Public-only entry (index.html). Used by the side-a-public Vercel project.
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
      },
    },
  },
});
