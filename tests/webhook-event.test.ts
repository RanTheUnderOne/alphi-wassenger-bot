import { describe, expect, it } from 'vitest'
import { parseInboundWebhook } from '../src/webhook-event.js'

describe('parseInboundWebhook', () => {
  it('normalizes both canonical and observed Wassenger inbound fields', () => {
    expect(parseInboundWebhook({ event: 'message:in:new', data: { message: { id: 'm-1', from: '9725@c.us', body: 'היי' }, chat: { id: '9725@c.us', labels: ['sales'] } } }))
      .toEqual({ event: 'message:in:new', id: 'm-1', from: '9725@c.us', phone: '9725@c.us', chatId: '9725@c.us', body: 'היי', labels: ['sales'] })
    expect(parseInboundWebhook({ event: 'message:in:new', data: { id: 'm-2', fromNumber: '972500000000', body: 'היי', chat: { id: 'chat-2' } } }))
      .toMatchObject({ id: 'm-2', phone: '972500000000', chatId: 'chat-2' })
  })
})
