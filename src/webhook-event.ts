import type { InboundSummary } from './agent-core.js'

export interface ParsedInbound extends InboundSummary {
  phone: string
  chatId: string
}

export function parseInboundWebhook(payload: unknown): ParsedInbound {
  const root = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>
  const data = (root.data && typeof root.data === 'object' ? root.data : root) as Record<string, unknown>
  const message = (data.message && typeof data.message === 'object' ? data.message : data) as Record<string, unknown>
  const chat = (data.chat && typeof data.chat === 'object' ? data.chat : {}) as Record<string, unknown>
  const rawLabels = Array.isArray(chat.labels) ? chat.labels : []
  const labels = rawLabels.flatMap(item => typeof item === 'string' ? [item] : item && typeof item === 'object' && 'name' in item ? [String((item as { name: unknown }).name)] : [])
  const from = String(message.from ?? data.fromNumber ?? '')
  const phone = String(message.fromNumber ?? data.fromNumber ?? message.from ?? '')
  return {
    event: String(root.event ?? ''), id: String(message.id ?? data.id ?? ''), from,
    phone, chatId: String(chat.id ?? message.chatId ?? from), body: String(message.body ?? message.text ?? data.body ?? '').trim(), labels
  }
}
