// Programmatic Vercel config — evaluated at build time, so each project gets
// routing for its own entry while sharing this repo and root (`web/`).
// NOTE: must default-export a plain object (not a function): Vercel's loader
// message-passes the export and cannot serialize functions.
//
// Per-project env (Vercel dashboard):
//   side-a-public: nothing (defaults to the public shell)
//   side-a-admin:  SITE_ENTRY=admin
//
// The backend lives on Render; /api/* is proxied there (same rule both ways).
// The negative lookahead keeps /assets/* (and any future static dirs) on the
// filesystem regardless of rewrite/filesystem precedence.

declare const process: { env: Record<string, string | undefined> };

const BACKEND = 'https://side-a-9g63.onrender.com';
const SHELL =
  (process.env.SITE_ENTRY ?? '').trim().toLowerCase() === 'admin' ? '/admin.html' : '/index.html';

interface Rewrite {
  source: string;
  destination: string;
}

const rewrites: Rewrite[] = [
  { source: '/api/:path*', destination: `${BACKEND}/api/:path*` },
  { source: '/health', destination: `${BACKEND}/health` },
  // Admin shell reachable by direct file URL on either project
  // (404s on the public project, which has no admin.html — intended).
  { source: '/admin', destination: '/admin.html' },
  { source: '/admin/:path*', destination: '/admin.html' },
  // SPA fallback for this project's shell (root explicit; deep links via
  // lookahead so /assets/* always stays on the filesystem).
  { source: '/', destination: SHELL },
  { source: '/((?!assets/).*)', destination: SHELL },
];

export default { rewrites };
