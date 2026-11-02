# 17 Games

Cloudflare Pages arcade lobby for 17 Spades with:

- [`/games/flappy-bee`](./public/games/flappy-bee/) — Flappy Bee (Ginza Honey Bee Project tribute)
- [`/games/coca-cola`](./public/games/coca-cola/) — Coca-Cola Recycle Rush

## Important: GitHub wiring

This Cursor cloud agent is **not** checked out from [england9/17games](https://github.com/england9/17games). It uses a temporary Cursor remote.

What exists today:

| Place | Contents |
| --- | --- |
| [england9/17games](https://github.com/england9/17games) | Source zips (`flappy-bee.zip`, `coca-cola.zip`) |
| This agent project | Full lobby + production builds of both games |

## Cloudflare Workers (Git-connected)

This repo deploys as a **static Worker** (`wrangler.jsonc` → `assets.directory = ./dist`).

In the Cloudflare dashboard for Worker **17games** → **Settings** → **Builds**:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Root directory | `/` (repo root) |
| Production branch | `main` |

`npm run deploy` runs `vite build` then `wrangler deploy`, so `dist/` exists before upload.

Custom domain: Worker → **Settings** → **Domains & Routes** → add `17spades.com` or `games.17spades.com`.

## Local development

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Rebuild games from source

Sources live under `games-src/` (extracted from your GitHub zips, without `node_modules`).

```bash
npm run build:flappy-bee
npm run build:coca-cola
npm run build
```
