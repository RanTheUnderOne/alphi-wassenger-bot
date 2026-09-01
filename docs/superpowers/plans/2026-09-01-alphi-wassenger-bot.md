# Alphi WhatsApp Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a Hebrew-only Alphi customer-information assistant on Vercel that receives inbound Wassenger WhatsApp webhooks, gives safe factual answers, and hands sensitive or uncertain conversations to a human.

**Architecture:** A Node.js Vercel Function accepts one inbound webhook route. Small focused modules validate Wassenger signatures, reject ineligible conversations, deduplicate message IDs, construct a tightly scoped OpenAI prompt from curated Alphi facts, and either send one reply or trigger human handoff. Persistent duplicate and bot-status records are supplied through a `ConversationStore` interface, enabling an in-memory local test double and a durable adapter before production activation.

**Tech Stack:** TypeScript, Node.js 24, Vercel Functions, OpenAI Node SDK, native `fetch` for Wassenger API calls, Vitest.

## Global Constraints

- Use Node.js runtime; do not use an Edge function because webhook HMAC verification uses Node `crypto`.
- Process only inbound, one-to-one WhatsApp messages that are inside the 24-hour reply window.
- Never log, return, commit, or expose `OPENAI_API_KEY`, `WASSENGER_API_KEY`, or `WASSENGER_WEBHOOK_SECRET`.
- `ESCALATE` is an internal model-control token, never a customer-facing message.
- Handoff for a human request, price, refund, legal, medical, complaint, order confirmation, uncertainty, or model/API failure.
- Do not configure a live Wassenger webhook until a Vercel preview passes private-message verification.
- The workspace is not a Git repository. Do not run Git commit commands until the repository is initialized or the project is placed in a repository.

---

## File structure

- `package.json` — scripts and runtime/test dependencies.
- `tsconfig.json` — strict TypeScript compilation configuration.
- `.gitignore` — excludes `.env.local`, dependencies, build output, and coverage.
- `src/config.ts` — validates required environment variables and exposes typed configuration.
- `src/types.ts` — Wassenger webhook, decision, and store interfaces.
- `src/knowledge/alphi.ts` — approved, curated Alphi knowledge and source URL.
- `src/security.ts` — raw-body HMAC verification using timing-safe comparison.
- `src/eligibility.ts` — deterministic ignore and handoff rules.
- `src/store.ts` — `ConversationStore` and in-memory test implementation.
- `src/wassenger.ts` — send text, label, and human-assignment API calls.
- `src/ai.ts` — OpenAI response generation and `ESCALATE` normalization.
- `src/process-message.ts` — orchestration; one result per accepted webhook event.
- `api/wassenger/webhook.ts` — Vercel HTTP handler.
- `tests/*.test.ts` — unit and route tests.
- `vercel.json` — Node runtime max duration only.
- `.env.example` — variable names only; no values.

## Task 1: Scaffold the strict, secret-safe Vercel function project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vercel.json`
- Create: `src/config.ts`
- Test: `tests/config.test.ts`

**Interfaces:**
- Produces `loadConfig(env: NodeJS.ProcessEnv): AppConfig`.
- `AppConfig` has `openAiApiKey`, `openAiModel`, `wassengerApiKey`, `wassengerWebhookSecret`, and exactly one of `handoffAgentId` / `handoffDepartmentId`.

- [ ] **Step 1: Write failing configuration tests**

```ts
import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/config.js'

const valid = {
  OPENAI_API_KEY: 'test-openai', OPENAI_MODEL: 'gpt-4.1-mini',
  WASSENGER_API_KEY: 'test-wassenger', WASSENGER_WEBHOOK_SECRET: 'test-secret',
  HANDOFF_AGENT_ID: 'agent-1'
}

describe('loadConfig', () => {
  it('returns typed configuration from required variables', () => expect(loadConfig(valid)).toMatchObject({ openAiModel: 'gpt-4.1-mini', handoffAgentId: 'agent-1' }))
  it('rejects missing secrets', () => expect(() => loadConfig({ ...valid, OPENAI_API_KEY: '' })).toThrow('OPENAI_API_KEY'))
  it('rejects two handoff targets', () => expect(() => loadConfig({ ...valid, HANDOFF_DEPARTMENT_ID: 'dept-1' })).toThrow('exactly one'))
})
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- --run tests/config.test.ts`

Expected: failure because the project and `loadConfig` do not yet exist.

- [ ] **Step 3: Add project files and minimal configuration implementation**

Create `package.json` with scripts `test: "vitest run"`, `test:watch: "vitest"`, `typecheck: "tsc --noEmit"`, and dependencies `openai`; add dev dependencies `typescript`, `vitest`, `@types/node`, and `@vercel/node`.

Implement `loadConfig` to throw for every blank required variable, default `OPENAI_MODEL` to `gpt-4.1-mini`, and require exactly one nonblank handoff target. Add `.env.local` and `.vercel` to `.gitignore`; put only variable names in `.env.example`.

- [ ] **Step 4: Run tests and static checking**

Run: `npm install; npm test -- --run tests/config.test.ts; npm run typecheck`

Expected: all commands exit 0 and no secret values appear in output.

- [ ] **Step 5: Record repository status**

Run: `git status --short`

Expected: do not run this command unless a Git repository has been initialized; record that this workspace is currently non-Git.

## Task 2: Define and test secure webhook verification and eligibility decisions

**Files:**
- Create: `src/types.ts`
- Create: `src/security.ts`
- Create: `src/eligibility.ts`
- Test: `tests/security.test.ts`
- Test: `tests/eligibility.test.ts`

**Interfaces:**
- `verifySignature(rawBody: string, signature: string | null, secret: string): boolean`.
- `decideEligibility(event: InboundMessageEvent): { kind: 'ignore' } | { kind: 'handoff'; reason: string } | { kind: 'answer' }`.

- [ ] **Step 1: Write failing security and decision tests**

```ts
it('accepts a valid HMAC and rejects an altered body', () => {
  const body = '{"id":"m-1"}'
  const signature = createHmac('sha256', 'secret').update(body).digest('hex')
  expect(verifySignature(body, signature, 'secret')).toBe(true)
  expect(verifySignature('{"id":"m-2"}', signature, 'secret')).toBe(false)
})

it.each(['price', 'refund', 'human', 'complaint'])('hands off sensitive intent: %s', body => {
  expect(decideEligibility(inbound({ body }))).toMatchObject({ kind: 'handoff' })
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test -- --run tests/security.test.ts tests/eligibility.test.ts`

Expected: failure because modules are absent.

- [ ] **Step 3: Implement the minimal deterministic rules**

Define `InboundMessageEvent` with message ID, body, message direction/type, chat type, contact number, agent assignment, labels, and inbound timestamp. Verify HMAC with `createHmac('sha256', secret)` and `timingSafeEqual`; reject missing/mismatched hex signatures without throwing. Ignore outbound, groups, assigned chats, `bot:off`/`human` labels, empty content, and messages older than 24 hours. Detect Hebrew and English handoff intent with explicit regular expressions.

- [ ] **Step 4: Run tests and type check**

Run: `npm test -- --run tests/security.test.ts tests/eligibility.test.ts; npm run typecheck`

Expected: all tests pass and malformed signatures never throw.

## Task 3: Create reviewable Alphi knowledge and model response module

**Files:**
- Create: `src/knowledge/alphi.ts`
- Create: `src/ai.ts`
- Test: `tests/ai.test.ts`

**Interfaces:**
- `ALPHI_KNOWLEDGE: readonly string[]`.
- `createSystemPrompt(knowledge: readonly string[]): string`.
- `generateReply(input: { body: string; history: ChatTurn[]; knowledge: readonly string[]; config: AppConfig; client: OpenAI }): Promise<{ kind: 'reply'; text: string } | { kind: 'handoff'; reason: string }>`.

- [ ] **Step 1: Write failing AI tests**

```ts
it('contains the knowledge and requires escalation for unknown claims', () => {
  expect(createSystemPrompt(['Alphi provides business AI agents.'])).toContain('Alphi provides business AI agents.')
  expect(createSystemPrompt(['fact'])).toContain('ESCALATE')
})

it('maps an ESCALATE completion to a handoff', async () => {
  const client = { chat: { completions: { create: async () => ({ choices: [{ message: { content: 'ESCALATE' } }] }) } } } } as never
  await expect(generateReply({ body: 'What is the exact price?', history: [], knowledge: ['fact'], config, client })).resolves.toEqual({ kind: 'handoff', reason: 'model_escalation' })
})
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- --run tests/ai.test.ts`

Expected: failure because the AI module is absent.

- [ ] **Step 3: Implement knowledge and AI boundaries**

Populate `ALPHI_KNOWLEDGE` only with facts reviewed from the existing Alphi website before deployment; include the website URL as a source comment. Build a Hebrew system prompt that prohibits prices, guarantees, legal/medical guidance, order confirmation, invented facts, and impersonation. Keep the last 10 turns, cap the reply at 5 short lines, call the OpenAI SDK, and convert a blank/error/`ESCALATE` response to `handoff`.

- [ ] **Step 4: Run the tests**

Run: `npm test -- --run tests/ai.test.ts; npm run typecheck`

Expected: pass; no network call is made because the test client is fake.

## Task 4: Add durable-operation interface and Wassenger action client

**Files:**
- Create: `src/store.ts`
- Create: `src/wassenger.ts`
- Test: `tests/store.test.ts`
- Test: `tests/wassenger.test.ts`

**Interfaces:**
- `ConversationStore.claimMessage(messageId: string): Promise<boolean>` returns `true` once per ID.
- `WassengerClient.sendText(chatId: string, text: string): Promise<void>`.
- `WassengerClient.handoff(chatId: string, target: HandoffTarget): Promise<void>`.

- [ ] **Step 1: Write failing tests**

```ts
it('claims a webhook message only once', async () => {
  const store = new MemoryConversationStore()
  expect(await store.claimMessage('m-1')).toBe(true)
  expect(await store.claimMessage('m-1')).toBe(false)
})

it('sends a human handoff with assignment and label operations', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
  await new WassengerClient('key', fetchMock).handoff('chat-1', { agentId: 'agent-1' })
  expect(fetchMock).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- --run tests/store.test.ts tests/wassenger.test.ts`

Expected: failure because the modules are absent.

- [ ] **Step 3: Implement operations with strict error handling**

Implement the memory store for local tests only. Keep `ConversationStore` independent so a production durable store can replace it. Make Wassenger requests through authenticated `fetch`; throw on non-2xx without including authorization values. Send one fixed Hebrew handoff message, then assign the configured target and add the `human` label. Use actual Wassenger API routes and payloads verified from the MCP tool schema before deployment.

- [ ] **Step 4: Run tests and static checking**

Run: `npm test -- --run tests/store.test.ts tests/wassenger.test.ts; npm run typecheck`

Expected: all tests pass, including non-2xx rejection behavior.

## Task 5: Implement and test the webhook route end to end

**Files:**
- Create: `src/process-message.ts`
- Create: `api/wassenger/webhook.ts`
- Create: `vercel.json`
- Test: `tests/process-message.test.ts`
- Test: `tests/webhook.test.ts`

**Interfaces:**
- `processInbound(event: InboundMessageEvent, dependencies: Dependencies): Promise<ProcessResult>`.
- `POST(request: Request): Promise<Response>` in the route handler.

- [ ] **Step 1: Write failing orchestration tests**

```ts
it('answers one eligible message exactly once', async () => {
  const result = await processInbound(inbound({ id: 'm-1', body: 'מה אלפי מציעה?' }), dependencies())
  expect(result).toEqual({ kind: 'replied' })
  expect(dependencies().wassenger.sendText).toHaveBeenCalledTimes(1)
})

it('returns 401 for an invalid signature and makes no outbound request', async () => {
  const response = await POST(new Request('https://bot.test/api/wassenger/webhook', { method: 'POST', body: '{}', headers: { 'x-wassenger-signature': 'bad' } }))
  expect(response.status).toBe(401)
})
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- --run tests/process-message.test.ts tests/webhook.test.ts`

Expected: failure because orchestration and route modules are absent.

- [ ] **Step 3: Implement route and orchestrator**

Read the request as raw text once, validate HMAC before JSON parsing, return `401` for invalid signatures and `400` for invalid JSON. Claim the message ID before AI work; return `200` with `{ "status": "duplicate" }` for duplicates. Map eligibility decisions to ignore, handoff, or AI reply. Catch all OpenAI and Wassenger failures, log only a stable error code/message ID, attempt human handoff once, and return `200` so Wassenger does not amplify retries.

Set `vercel.json` to apply `maxDuration: 30` to `api/wassenger/webhook.ts`; use Node.js runtime.

- [ ] **Step 4: Run the full automated suite**

Run: `npm test; npm run typecheck`

Expected: all tests pass; no test reads `.env.local` or calls external APIs.

## Task 6: Deploy preview, add Vercel configuration, and perform private WhatsApp verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: deployment environment-variable configuration in Vercel dashboard/project settings
- Modify: Wassenger webhook configuration only after preview verification

**Interfaces:**
- Production webhook URL: `https://<vercel-project>.vercel.app/api/wassenger/webhook`.

- [ ] **Step 1: Write operational checklist in README**

Document the exact required environment-variable names, how to set `HANDOFF_AGENT_ID` or `HANDOFF_DEPARTMENT_ID`, how to apply `bot:off`, and that the URL must not be registered in Wassenger before the preview test passes.

- [ ] **Step 2: Deploy a preview without secrets in source control**

Run: `vercel deploy`

Expected: a preview URL is returned; no secret is printed.

- [ ] **Step 3: Set Vercel environment variables through Vercel’s secret management**

Set `OPENAI_API_KEY`, `OPENAI_MODEL`, `WASSENGER_API_KEY`, `WASSENGER_WEBHOOK_SECRET`, and exactly one handoff target. Do not use the local MCP token unless it is explicitly copied by the user into Vercel’s secret setting.

- [ ] **Step 4: Execute private preview tests**

Send an inbound test from a non-business WhatsApp number and verify: (a) factual Alphi FAQ gets one Hebrew reply; (b) “אני רוצה נציג” gets one handoff response and a `human` label; (c) an altered signature receives `401`; (d) replaying an event results in no second customer reply; (e) `bot:off` produces no AI reply.

- [ ] **Step 5: Activate production only with explicit authorization**

Register the production webhook with Wassenger and set the Vercel deployment as production only after the user explicitly authorizes this external activation.

## Self-review

- Spec coverage: Tasks 1–5 implement configuration, signature verification, eligibility, curated knowledge, AI replies, duplicate handling, handoff, kill-switch behavior, and automated tests. Task 6 covers preview and controlled activation.
- Placeholder scan: no `TBD` or `TODO` markers; the explicit human review of Alphi facts is a release gate, not an unspecified implementation item.
- Type consistency: route uses `processInbound`, which consumes `InboundMessageEvent`, `Dependencies`, and `ConversationStore` defined by Tasks 2 and 4; AI output uses the same reply/handoff union defined in Task 3.
