export interface ConversationStore {
  claimMessage(id: string): Promise<boolean>
  addOptOut(phone: string): Promise<void>
  isEnabled(): Promise<boolean>
  resetConversation(chatId: string): Promise<void>
  getHistory(chatId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string }>>
  appendHistory(chatId: string, turn: { role: 'user' | 'assistant'; content: string }): Promise<void>
}

type Fetcher = typeof fetch

export class UpstashConversationStore implements ConversationStore {
  constructor(private readonly url: string, private readonly token: string, private readonly fetcher: Fetcher = fetch) {}

  private async command(parts: string[]) {
    const path = parts.map(encodeURIComponent).join('/')
    const response = await this.fetcher(`${this.url.replace(/\/$/, '')}/${path}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    })
    if (!response.ok) throw new Error(`Redis request failed: ${response.status}`)
    return response.json() as Promise<{ result: unknown }>
  }

  async claimMessage(id: string) {
    const result = await this.command(['set', `seen:${id}`, '1', 'EX', '172800', 'NX'])
    return result.result === 'OK'
  }

  async addOptOut(phone: string) { await this.command(['set', `optout:${phone}`, '1']) }
  async isEnabled() {
    const result = await this.command(['get', 'bot:enabled'])
    return result.result !== 'false' && result.result !== '0'
  }
  async resetConversation(chatId: string) { await this.command(['del', `history:${chatId}`]) }
  async getHistory(chatId: string) {
    const result = await this.command(['lrange', `history:${chatId}`, '0', '-1'])
    if (!Array.isArray(result.result)) return []
    return result.result.flatMap(item => {
      try {
        const parsed = JSON.parse(String(item))
        return parsed?.role === 'user' || parsed?.role === 'assistant' ? [{ role: parsed.role, content: String(parsed.content || '') }] : []
      } catch { return [] }
    })
  }
  async appendHistory(chatId: string, turn: { role: 'user' | 'assistant'; content: string }) {
    const key = `history:${chatId}`
    await this.command(['rpush', key, JSON.stringify(turn)])
    await this.command(['ltrim', key, '-20', '-1'])
    await this.command(['expire', key, '604800'])
  }
}
