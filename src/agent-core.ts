export type InboundDecision =
  | { kind: 'answer' }
  | { kind: 'ignore' }
  | { kind: 'sensitive' }
  | { kind: 'opt_out' }
  | { kind: 'bot_disabled' }

export interface InboundSummary {
  event: string
  id: string
  from: string
  body: string
  labels: string[]
}

const SENSITIVE = /(?:מחיר|כמה.*עולה|עלות|הצעת מחיר|החזר|זיכוי|תלונה|נציג|בן אדם|אדם|משפטי|עורך.?דין|רפואי|רופא|הזמנה|ביטול|refund|price|human|agent|complaint|legal|medical)/i
const OPT_OUT = /^(?:stop|baja|unsubscribe)$/i

export function decideInbound(message: InboundSummary): InboundDecision {
  const body = message.body.trim()
  const labels = message.labels.map(label => label.toLowerCase())
  if (message.event !== 'message:in:new' || !message.id || !body || /@g\.us$/i.test(message.from)) return { kind: 'ignore' }
  if (labels.includes('bot:off') || labels.includes('human')) return { kind: 'bot_disabled' }
  if (OPT_OUT.test(body)) return { kind: 'opt_out' }
  if (SENSITIVE.test(body)) return { kind: 'sensitive' }
  return { kind: 'answer' }
}
