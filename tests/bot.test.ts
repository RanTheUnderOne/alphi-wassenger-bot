import { describe, expect, it } from 'vitest'
import { decide, createReply } from '../src/bot.js'

describe('Alphi bot decisions', () => {
  it('hands a price request to a person', () => {
    expect(decide('כמה זה עולה?')).toEqual({ kind: 'handoff' })
  })

  it('answers a general information request in Hebrew', () => {
    expect(createReply('מה אלפי עושה?')).toContain('אלפי')
  })
})
