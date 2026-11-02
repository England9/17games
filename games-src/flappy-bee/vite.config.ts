import { defineConfig } from 'vite'

export default defineConfig({
  base: '/games/flappy-bee/',
  server: {
    host: '0.0.0.0',
    port: 43128,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 43128,
    strictPort: true,
  },
})
