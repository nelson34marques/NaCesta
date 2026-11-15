const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const MAX_BODY_BYTES = 16 * 1024
const MAX_SUBJECT = 200
const MAX_TEXT = 4000

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ESCAPES[character])
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []

    request.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload too large'))
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

function sendJSON(response, status, payload) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
}

function normalizeRecipients(value) {
  return String(value ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean)
}

export function createNotifyMiddleware({ apiKey, to, from } = {}) {
  const recipients = normalizeRecipients(to)
  const sender = String(from ?? '').trim() || 'NBA Today <onboarding@resend.dev>'
  const enabled = Boolean(apiKey && recipients.length)

  return async function notifyMiddleware(request, response, next) {
    const url = new URL(request.url ?? '/', 'http://localhost')

    if (url.pathname === '/api/notify/status' && request.method === 'GET') {
      sendJSON(response, 200, { enabled })
      return
    }

    if (url.pathname !== '/api/notify') {
      next()
      return
    }

    if (request.method !== 'POST') {
      sendJSON(response, 405, { error: 'method not allowed' })
      return
    }

    if (!enabled) {
      sendJSON(response, 503, { error: 'email not configured' })
      return
    }

    let payload
    try {
      payload = JSON.parse(await readBody(request))
    } catch {
      sendJSON(response, 400, { error: 'invalid payload' })
      return
    }

    const subject = String(payload?.subject ?? '').trim().slice(0, MAX_SUBJECT)
    const text = String(payload?.text ?? '').trim().slice(0, MAX_TEXT)

    if (!subject || !text) {
      sendJSON(response, 400, { error: 'subject and text are required' })
      return
    }

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background: #0b0d12; padding: 24px">
        <div style="max-width: 520px; margin: 0 auto; background: #12151d; border: 1px solid #262b38; border-radius: 16px; padding: 24px; color: #e8ebf5">
          <p style="margin: 0 0 8px; color: #ff5c2b; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase">NBA Today</p>
          <h1 style="margin: 0 0 12px; font-size: 20px">${escapeHtml(subject)}</h1>
          <p style="margin: 0; color: #a6adc1; font-size: 14px; line-height: 1.5">${escapeHtml(text)}</p>
        </div>
      </div>
    `.trim()

    try {
      const resendResponse = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: recipients,
          subject,
          text,
          html,
        }),
      })

      const data = await resendResponse.json().catch(() => null)

      if (!resendResponse.ok) {
        console.error(
          '[notify] Resend falhou:',
          resendResponse.status,
          data?.message ?? 'sem detalhe',
        )
        sendJSON(response, 502, { error: 'email delivery failed' })
        return
      }

      sendJSON(response, 200, { ok: true, id: data?.id ?? null })
    } catch (error) {
      console.error('[notify] erro ao contactar Resend:', error.message)
      sendJSON(response, 502, { error: 'email delivery failed' })
    }
  }
}
