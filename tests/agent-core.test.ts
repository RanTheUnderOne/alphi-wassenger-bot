import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { decideInbound } from '../src/agent-core.js'
import { verifyWassengerSignature } from '../src/wassenger-security.js'

describe('Wassenger security', () => {
  it('accepts the signed raw body and rejects an altered body', () => {
    const raw = '{"event":"message:in:new"}'
    const digest = createHmac('sha256', 'secret').update(raw).digest('hex')

    expect(verifyWassengerSignature(raw, `sha256=${digest}`, 'secret')).toBe(true)
    expect(verifyWassengerSignature('{"event":"message:in:new","x":1}', `sha256=${digest}`, 'secret')).toBe(false)
  })

  it('allows an unsigned webhook only while the explicit temporary bypass is enabled', () => {
    expect(verifyWassengerSignature('{"event":"message:in:new"}', undefined, 'secret', true)).toBe(true)
    expect(verifyWassengerSignature('{"event":"message:in:new"}', undefined, 'secret', false)).toBe(false)
  })
})

describe('AI agent inbound gate', () => {
  it.each([
    ['מחיר בבקשה', 'sensitive'],
    ['אני רוצה נציג', 'sensitive'],
    ['STOP', 'opt_out'],
    ['היי', 'bot_disabled']
  ] as const)('routes %s safely', (body, expected) => {
    const result = decideInbound({
      event: 'message:in:new', id: 'm-1', from: '972500000000@c.us', body,
      labels: expected === 'bot_disabled' ? ['bot:off'] : []
    })
    expect(result.kind).toBe(expected)
  })

  it('accepts a normal one-to-one inbound question', () => {
    expect(decideInbound({ event: 'message:in:new', id: 'm-1', from: '972500000000@c.us', body: 'מה אלפי עושה?', labels: [] }))
      .toEqual({ kind: 'answer' })
  })
})
