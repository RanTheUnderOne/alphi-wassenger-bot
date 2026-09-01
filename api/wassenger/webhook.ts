import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { decideInbound } from '../../src/agent-core.js'
import { generateAlphiReply } from '../../src/ai-agent.js'
import { loadConfig } from '../../src/config.js'
import { UpstashConversationStore } from '../../src/store.js'
import { verifyWassengerSignature } from '../../src/wassenger-security.js'
import { parseInboundWebhook } from '../../src/webhook-event.js'

async function readRawBody(request: VercelRequest): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

async function sendWassenger(apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch('https://api.wassenger.com/v1/messages', {
    method: 'POST',
    headers: { Token: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) throw new Error(`Wassenger send failed: ${response.status}`)
}

export const config = { api: { bodyParser: false } }

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
  let app
  try { app = loadConfig(process.env) } catch { return response.status(503).json({ status: 'misconfigured' }) }
  const rawBody = await readRawBody(request)
  const signature = request.headers['x-wassenger-signature']
  if (!verifyWassengerSignature(rawBody, Array.isArray(signature) ? signature[0] : signature, app.wassengerWebhookSecret, process.env.ALLOW_UNSIGNED_WASSENGER_WEBHOOK === 'true')) {
    return response.status(401).json({ error: 'invalid signature' })
  }
  let inbound
  try { inbound = parseInboundWebhook(JSON.parse(rawBody)) } catch { return response.status(400).json({ error: 'invalid payload' }) }
  const store = new UpstashConversationStore(app.redisRestUrl, app.redisRestToken)
  if (!inbound.id || !(await store.claimMessage(inbound.id))) return response.status(200).json({ status: 'duplicate' })
  if (!(await store.isEnabled())) return response.status(200).json({ status: 'bot_disabled' })
  const decision = decideInbound(inbound)
  if (decision.kind === 'ignore' || decision.kind === 'bot_disabled') return response.status(200).json({ status: decision.kind })
  if (decision.kind === 'opt_out') {
    await store.addOptOut(inbound.phone)
    return response.status(200).json({ status: 'opted_out' })
  }

  const send = (payload: Record<string, unknown>) => sendWassenger(app.wassengerApiKey, payload)
  const handoff = async (reason: string) => {
    console.info('bot_handoff', { messageId: inbound.id, reason })
    const assignment = app.handoffAgentId
      ? { action: 'chat:assign', params: { agent: app.handoffAgentId } }
      : { action: 'chat:assign', params: { department: app.handoffDepartmentId } }
    await send({ phone: inbound.phone, message: 'בשמחה — אני מעביר/ה את הפנייה שלך לנציג/ה מצוות אלפי.', enqueue: 'never', actions: [assignment, { action: 'labels:add', params: { labels: ['human'] } }] })
  }

  try {
    if (decision.kind === 'sensitive') {
      await handoff('policy')
      return response.status(200).json({ status: 'handoff' })
    }
    if (inbound.body === 'אתחולציק') {
      await store.resetConversation(inbound.chatId)
      await send({ phone: inbound.phone, message: 'היי, אני העוזר/ת של אלפי. ספר/י לי בקצרה על העסק ומה היית רוצה לשפר בעזרת AI.', enqueue: 'never' })
      return response.status(200).json({ status: 'initialized' })
    }
    const history = await store.getHistory(inbound.chatId)
    const client = new OpenAI({ apiKey: app.openAiApiKey })
    const ai = await generateAlphiReply(inbound.body, history, app, request => client.chat.completions.create(request))
    if (ai.kind === 'handoff') {
      await handoff('model_or_error')
      return response.status(200).json({ status: 'handoff' })
    }
    await send({ phone: inbound.phone, message: ai.text, enqueue: 'never' })
    await store.appendHistory(inbound.chatId, { role: 'user', content: inbound.body })
    await store.appendHistory(inbound.chatId, { role: 'assistant', content: ai.text })
    return response.status(200).json({ status: 'replied' })
  } catch (error) {
    console.error('bot_processing_failed', { messageId: inbound.id })
    try {
      await handoff('runtime_error')
      return response.status(200).json({ status: 'handoff_fallback' })
    } catch {
      return response.status(200).json({ status: 'failed_safe' })
    }
  }
}
