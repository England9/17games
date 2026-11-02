# 17 Games

Cloudflare Pages arcade lobby for 17 Spades with:

- [`/games/flappy-bee`](./public/games/flappy-bee/) — your Flappy Bee build (Ginza Honey Bee Project tribute)
- [`/games/coca-cola`](./public/games/coca-cola/) — playable placeholder until a real Coca-Cola build is uploaded

## Important: GitHub wiring

This Cursor cloud agent is **not** checked out from [england9/17games](https://github.com/england9/17games). It uses a temporary Cursor remote.

What exists today:

| Place | Contents |
| --- | --- |
| [england9/17games](https://github.com/england9/17games) | `flappy-bee.zip`, empty `coca-cola.zip`, README |
| This agent project | Full lobby + built Flappy Bee + Coca-Cola placeholder |

To deploy on Cloudflare Pages against GitHub:

1. Put **this project’s files** on `england9/17games` (replace the zip-only commit), **or** click **Create repo** in Cursor and point Pages at that new GitHub repo.
2. Cloudflare → Workers & Pages → Create → Connect to Git → select the repo.
3. Build command: `npm run build` · Output directory: `dist` · Branch: `main`.
4. Attach `17spades.com` (or a subdomain) as a custom domain.

This agent cannot push to `england9/17games` without GitHub credentials for that account.

## Local development

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Rebuild Flappy Bee from source

Source lives in `games-src/flappy-bee` (extracted from your GitHub zip, without `node_modules`).

```bash
npm run build:flappy-bee
npm run build
```

## Coca-Cola game

`coca-cola.zip` on GitHub currently contains only an empty folder. Re-upload a real build (or zip the game folder with `index.html` inside), and it can replace `public/games/coca-cola/`.
