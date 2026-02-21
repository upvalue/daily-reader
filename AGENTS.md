# Daily Reader

A minimal daily reading app. Read one passage at a time from classic texts. Bookmarks track progress.

## Stack

- **Frontend:** React 19, TanStack Router + Query, tRPC client, Tailwind CSS 4, Vite 6
- **Backend:** Express 5, tRPC 11, Kysely, better-sqlite3
- **Language:** TypeScript throughout

## Structure

- `src/client/` — React SPA with file-based routing (`src/client/routes/`)
- `src/server/` — Express + tRPC API (`router.ts` has all procedures, `db.ts` has schema)
- `daily-reader.db` — SQLite database file

## Commands

```
pnpm dev          # run client (5173) + server (3001) concurrently
pnpm build        # production build
pnpm db:seed      # seed database from seed.base.sql + seed.private.sql (if present)
```

## Deployment

`runsvdir` (PID 1) supervises services in `/workspace/sv/`:

- **caddy** — reverse proxy on port 8000, configured via `/workspace/Caddyfile`
- **tailscale-serve** — exposes Caddy over the tailnet with `tailscale serve 8000`

Manage services with `sv status|restart|down|up /workspace/sv/<service>`.
