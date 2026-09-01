import { describe, expect, it, vi } from 'vitest'
import { UpstashConversationStore } from '../src/store.js'

describe('UpstashConversationStore', () => {
  it('claims a message once using Redis NX and expiry', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 'OK' }), { status: 200 }))
    const store = new UpstashConversationStore('https://redis.example', 'token', fetcher)

    await expect(store.claimMessage('message 1')).resolves.toBe(true)
    expect(fetcher).toHaveBeenCalledWith(
      'https://redis.example/set/seen%3Amessage%201/1/EX/172800/NX',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) })
    )
  })

  it('returns false when the message was already claimed', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: null }), { status: 200 }))
    const store = new UpstashConversationStore('https://redis.example', 'token', fetcher)
    await expect(store.claimMessage('m-1')).resolves.toBe(false)
  })

  it('stores compact conversation turns with a seven-day expiry', async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200 })))
    const store = new UpstashConversationStore('https://redis.example', 'token', fetcher)
    await store.appendHistory('chat-1', { role: 'user', content: 'היי' })
    expect(fetcher).toHaveBeenCalledWith(
      'https://redis.example/rpush/history%3Achat-1/%7B%22role%22%3A%22user%22%2C%22content%22%3A%22%D7%94%D7%99%D7%99%22%7D',
      expect.anything()
    )
    expect(fetcher).toHaveBeenCalledWith(
      'https://redis.example/ltrim/history%3Achat-1/-20/-1',
      expect.anything()
    )
  })
})
