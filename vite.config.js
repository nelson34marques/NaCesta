import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createNotifyMiddleware } from './server/notify.js'

const espnProxy = {
  '/api/espn': {
    target: 'https://site.api.espn.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/espn/, ''),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Referer: 'https://www.espn.com/',
    },
  },
}

function notifyPlugin(env) {
  const middleware = createNotifyMiddleware({
    apiKey: env.RESEND_API_KEY,
    to: env.NOTIFY_EMAIL,
    from: env.NOTIFY_FROM,
  })

  return {
    name: 'nbatoday-notify',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), notifyPlugin(env)],
    server: { proxy: espnProxy },
    preview: { proxy: espnProxy },
  }
})
