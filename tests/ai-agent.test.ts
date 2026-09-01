import { describe, expect, it, vi } from 'vitest'
import { createAlphiPrompt, generateAlphiReply } from '../src/ai-agent.js'

const config = { openAiApiKey: 'key', openAiModel: 'gpt-5.6-luna' }

describe('Alphi AI response guardrail', () => {
  it('defines a Hebrew WhatsApp assistant that escalates unknown and sensitive matters', () => {
    const prompt = createAlphiPrompt()
    expect(prompt).toContain('ESCALATE')
    expect(prompt).toContain('אלפי')
    expect(prompt).toContain('מחירים')
  })

  it('presents Alfi as a live product demonstration and keeps the sales discovery focused', () => {
    const prompt = createAlphiPrompt()
    expect(prompt).toContain('הדגמת לייב')
    expect(prompt).toContain('עובד דיגיטלי לעסקים')
    expect(prompt).toContain('3 שאלות')
    expect(prompt).toContain('שם')
  })

  it('passes the latest 20 history turns to the model', async () => {
    const create = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'איך העסק שלך עובד היום?' } }] })
    const history = Array.from({ length: 25 }, (_, index) => ({ role: 'user' as const, content: `turn-${index}` }))
    await generateAlphiReply('היי', history, config, create)
    const messages = create.mock.calls[0][0].messages
    expect(messages).toHaveLength(22)
    expect(messages[1].content).toBe('turn-5')
  })

  it('turns ESCALATE into a handoff without returning it to the customer', async () => {
    const create = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'ESCALATE' } }] })
    await expect(generateAlphiReply('כמה זה עולה?', [], config, create)).resolves.toEqual({ kind: 'handoff' })
  })

  it('keeps a non-empty model answer as a short reply', async () => {
    const create = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'אלפי עוזרת לעסקים עם פתרונות AI.' } }] })
    await expect(generateAlphiReply('מה אלפי עושה?', [], config, create)).resolves.toEqual({ kind: 'reply', text: 'אלפי עוזרת לעסקים עם פתרונות AI.' })
  })
})
