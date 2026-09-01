export interface AppConfig {
  openAiApiKey: string
  openAiModel: string
  wassengerApiKey: string
  wassengerWebhookSecret: string
  redisRestUrl: string
  redisRestToken: string
  handoffAgentId?: string
  handoffDepartmentId?: string
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const handoffAgentId = env.HANDOFF_AGENT_ID?.trim() || undefined
  const handoffDepartmentId = env.HANDOFF_DEPARTMENT_ID?.trim() || undefined
  if (Boolean(handoffAgentId) === Boolean(handoffDepartmentId)) {
    throw new Error('exactly one handoff target is required')
  }

  return {
    openAiApiKey: required(env, 'OPENAI_API_KEY'),
    openAiModel: env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini',
    wassengerApiKey: required(env, 'WASSENGER_API_KEY'),
    wassengerWebhookSecret: required(env, 'WASSENGER_WEBHOOK_SECRET'),
    redisRestUrl: required(env, 'KV_REST_API_URL'),
    redisRestToken: required(env, 'KV_REST_API_TOKEN'),
    handoffAgentId,
    handoffDepartmentId
  }
}
