# 17 Games

A small Cloudflare Pages arcade for [17 Spades](https://17spades.com) with two playable games:

- [`/games/flappy-bee`](./public/games/flappy-bee/) — Flappy Bee
- [`/games/coca-cola`](./public/games/coca-cola/) — Coca-Cola

Designed to deploy from GitHub (`england9/17games`) to Cloudflare Pages, then map a custom route or domain such as `17spades.com`.

## Local development

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
npm run build
npm run pages:dev
```

## Replace with your game builds

Each game is a self-contained folder under `public/games/<name>/`.

To swap in your own files, replace the contents of:

- `public/games/flappy-bee/`
- `public/games/coca-cola/`

Keep an `index.html` at the root of each folder so these URLs stay stable:

- `/games/flappy-bee/`
- `/games/coca-cola/`

## Cloudflare Pages setup

1. Push this repo to GitHub (`england9/17games`).
2. In Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select `england9/17games`, production branch `main`.
4. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. After the first deploy, add a custom domain (for example `17spades.com` or `games.17spades.com`).
6. If the marketing site already owns the apex, add path-based routing or a subdomain and link to `/games/flappy-bee` and `/games/coca-cola`.

`wrangler.jsonc` points Pages at `dist` for local `wrangler pages` commands.
