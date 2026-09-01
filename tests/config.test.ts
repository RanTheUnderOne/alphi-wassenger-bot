import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/config.js'

const valid = {
  OPENAI_API_KEY: 'test-openai',
  OPENAI_MODEL: 'gpt-4.1-mini',
  WASSENGER_API_KEY: 'test-wassenger',
  WASSENGER_WEBHOOK_SECRET: 'test-secret',
  KV_REST_API_URL: 'https://redis.example',
  KV_REST_API_TOKEN: 'test-redis',
  HANDOFF_AGENT_ID: 'agent-1'
}

describe('loadConfig', () => {
  it('returns typed configuration from required variables', () => {
    expect(loadConfig(valid)).toMatchObject({
      openAiModel: 'gpt-4.1-mini',
      handoffAgentId: 'agent-1'
    })
  })

  it('rejects missing secrets', () => {
    expect(() => loadConfig({ ...valid, OPENAI_API_KEY: '' })).toThrow('OPENAI_API_KEY')
  })

  it('allows the bot to run before a human handoff target is configured', () => {
    expect(() => loadConfig({ ...valid, HANDOFF_AGENT_ID: '', HANDOFF_DEPARTMENT_ID: '' })).toThrow('exactly one')
  })

  it('requires the durable Redis credentials', () => {
    expect(() => loadConfig({ ...valid, KV_REST_API_TOKEN: '' })).toThrow('KV_REST_API_TOKEN')
  })
})
