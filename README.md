# side-a

Lean single-app monolith — Fastify + raw Postgres (`postgres` tagged templates). No ORM, no Turbo/Redis.
Payments external: Tix Africa (tickets, per-edition) + Monnify payment link (merch, per-cart total). Backend tracks `spotsLeft = capacity - spotsSold` and merch `remaining`.

## Quick start

```sh
# backend
npm install
cp .env.example .env   # set DATABASE_URL + optional TIX_AFRICA/MONNIFY
npm run migrate
npm run dev            # http://localhost:3000

# frontend (separate terminal)
npm install --prefix web
npm run dev --prefix web  # http://localhost:5173 → proxies /api to 3000
```

## Scripts

| Script | Where | What it does |
|---|---:|---|
| `npm run dev` | `side-a/` | `tsx watch src/server.ts` |
| `npm run migrate` | `side-a/` | runs `src/db/sql/*.sql` in order |
| `npm run typecheck` | `side-a/` | `tsc --noEmit` |
| `npm run build` | `side-a/` | `tsc` → `dist/` |
| `npm run dev` | `side-a/web/` | `vite --port 5173` |
| `npm run build` | `side-a/web/` | `vite build` → `web/dist/` |

## Env

`DATABASE_URL` (required), `PORT`, `ALLOWED_ORIGINS`, `LOG_LEVEL`, `TIX_AFRICA_EVENT_ID`, `TIX_AFRICA_EVENT_URL`, `MONNIFY_PAYMENT_BASE_URL` (per-cart), `GOOGLE_CLIENT_ID` (board votes gated). See `src/config.ts:4`.

## Payments & Inventory

- Tickets: “Get tickets” links to `editions.tix_africa_url` (one event per edition). Live `GET /api/editions` shows `spotsLeft`. Manual `POST /api/admin/sync/editions/:id` or `POST /api/webhooks/tix-africa` updates `spots_sold` (capped by capacity).
- Merch: `POST /api/merch/orders` returns `monnifyLink` (per-cart total) for redirect. `GET /api/merch` shows `remaining`. Webhook/manual sync increments `sold`.

## Structure

- `src/server.ts` — entry
- `src/app.ts` — `buildApp()` (Fastify wiring, registers `/api` prefix)
- `src/config.ts` — zod env
- `src/db/` — `postgres` singleton + file-based migrations (`00N_*.sql`, `name/kind` on editions, `upvotes/downvotes` on board, `source` on updates)
- `src/modules/editions` (`name`/`kind` physical/virtual + `meta`, spotsLeft, `tixAfricaUrl` per edition), `songs`, `recommendations`+`board` (top-12 by `score`), `merch`, `updates` (`source` manual), `home`, `webhooks`, `admin`
- `web/index.html` + `style.css` + `app.js` — static frontend (Vite proxies `/api`), board votes require `Authorization: Bearer <google_id_token>`

## Board & Weekly Reset

- `GET /api/board` → 12 queued submissions by `score=upvotes-downvotes`. Votes via `POST /api/board/:id/vote` (Google-gated, 401 otherwise).
- `POST /api/admin/board/pick {id}` hand-picks winner → creates `songs` current, archives all other queued (new week = fresh board).
