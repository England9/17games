import { defineConfig } from 'vite'

/** Serve each public/games/<name>/index.html for clean game directory URLs. */
function gamesDirectoryIndex() {
  const map = {
    '/games/flappy-bee': '/games/flappy-bee/index.html',
    '/games/flappy-bee/': '/games/flappy-bee/index.html',
    '/games/coca-cola': '/games/coca-cola/index.html',
    '/games/coca-cola/': '/games/coca-cola/index.html',
  }

  return {
    name: 'games-directory-index',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next()
        const path = req.url.split('?')[0]
        if (map[path]) req.url = map[path]
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next()
        const path = req.url.split('?')[0]
        if (map[path]) req.url = map[path]
        next()
      })
    },
  }
}

export default defineConfig({
  appType: 'mpa',
  plugins: [gamesDirectoryIndex()],
  server: {
    host: '127.0.0.1',
    port: 43127,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 43127,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
