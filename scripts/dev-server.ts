import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import handler from '../api/wassenger/webhook.js'

const PORT = Number(process.env.PORT ?? 3000)

function augmentResponse(res: ServerResponse) {
  const vercelRes = res as ServerResponse & {
    status: (code: number) => typeof vercelRes
    json: (body: unknown) => typeof vercelRes
    send: (body: unknown) => typeof vercelRes
  }
  vercelRes.status = (code: number) => {
    res.statusCode = code
    return vercelRes
  }
  vercelRes.json = (body: unknown) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(body))
    return vercelRes
  }
  vercelRes.send = (body: unknown) => {
    res.end(typeof body === 'string' ? body : JSON.stringify(body))
    return vercelRes
  }
  return vercelRes
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? '/'
  if (!url.startsWith('/api/wassenger/webhook')) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'not found', hint: 'POST /api/wassenger/webhook' }))
    return
  }
  try {
    // The Vercel handler expects VercelRequest/VercelResponse, which are structural
    // supersets of Node's IncomingMessage/ServerResponse for the fields used here.
    await handler(req as never, augmentResponse(res) as never)
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'unhandled', message: String(error) }))
  }
})

server.listen(PORT, () => {
  console.log(`Local dev server listening on http://localhost:${PORT}`)
  console.log('Webhook endpoint: POST http://localhost:' + PORT + '/api/wassenger/webhook')
})
