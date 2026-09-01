import { verifyWebhookToken } from '../src/wassenger-security.js'
import { describe, expect, it } from 'vitest'

describe('verifyWebhookToken', () => {
  it('accepts only the configured webhook token', () => {
    expect(verifyWebhookToken('secret', 'secret')).toBe(true)
    expect(verifyWebhookToken('other', 'secret')).toBe(false)
  })
})
