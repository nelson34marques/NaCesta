import http from 'node:http'
import { createNotifyMiddleware } from './notify.js'

const PORT = Number(process.env.PORT ?? 10000)
const SECRET = process.env.NOTIFY_SECRET ?? ''
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const MAX_REQUESTS_PER_MINUTE = Number(process.env.NOTIFY_RATE_LIMIT ?? 10)

const notifyMiddleware = createNotifyMiddleware({
  apiKey: process.env.RESEND_API_KEY,
  to: process.env.NOTIFY_EMAIL,
  from: process.env.NOTIFY_FROM,
})

const buckets = new Map()

function sendJSON(response, status, payload) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin
  if (!origin) return

  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Notify-Secret')
  }
}

function isRateLimited(request) {
  const key = request.socket.remoteAddress ?? 'unknown'
  const now = Date.now()
  const bucket = buckets.get(key) ?? { count: 0, reset: now + 60_000 }

  if (now > bucket.reset) {
    bucket.count = 0
    bucket.reset = now + 60_000
  }

  bucket.count += 1
  buckets.set(key, bucket)
  return bucket.count > MAX_REQUESTS_PER_MINUTE
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  setCorsHeaders(request, response)

  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.end()
    return
  }

  if (url.pathname === '/healthz') {
    sendJSON(response, 200, { ok: true })
    return
  }

  if (!url.pathname.startsWith('/api/notify')) {
    sendJSON(response, 404, { error: 'not found' })
    return
  }

  if (
    url.pathname === '/api/notify' &&
    SECRET &&
    request.headers['x-notify-secret'] !== SECRET
  ) {
    sendJSON(response, 401, { error: 'unauthorized' })
    return
  }

  if (url.pathname === '/api/notify' && request.method === 'POST' && isRateLimited(request)) {
    sendJSON(response, 429, { error: 'too many requests' })
    return
  }

  await notifyMiddleware(request, response, () => {
    sendJSON(response, 404, { error: 'not found' })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[notify] a ouvir em http://0.0.0.0:${PORT}`)
})
