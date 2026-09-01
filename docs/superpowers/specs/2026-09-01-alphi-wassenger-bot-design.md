# Alphi WhatsApp bot: design

## Goal

Run a small, production-safe Hebrew WhatsApp assistant for Alphi. It answers inbound requests with approved general business information and hands the chat to a human when it should not answer.

## Architecture

```text
Customer WhatsApp message
  -> Wassenger inbound webhook
  -> Vercel `/api/wassenger/webhook`
  -> signature + eligibility + duplicate checks
  -> Alphi knowledge source + OpenAI
  -> Wassenger message reply OR human handoff
```

The Vercel function is stateless. A lightweight persistent store is required before production for webhook idempotency and the per-chat kill switch; the first private test may use an in-memory fallback only when Vercel runs a single request at a time, but it must not be described as reliable production behavior.

## Components

### Webhook endpoint

- Accept only Wassenger inbound-message events.
- Verify the `X-Wassenger-Signature` against the raw request body before processing.
- Return success promptly and perform only bounded work.
- Dedupe by Wassenger message ID; never reply twice to one inbound message.

### Eligibility and human handoff

The bot ignores group chats, messages from the business number, chats assigned to a human, and chats marked `bot:off` or `human`.

It hands off instead of generating an AI answer when a customer asks for a person, asks for a price, refund, legal/medical guidance, complaint handling, order confirmation, or when the model signals uncertainty. The handoff sends one concise message, assigns the chat to the configured human/department, and adds the `human` label.

### AI response

- Hebrew-first system instructions describe Alphi as an AI assistant, not a human.
- The model answers only from the supplied Alphi knowledge and recent messages.
- Replies are short, factual, and limited to the WhatsApp 24-hour inbound window.
- The literal result `ESCALATE` is never sent to a customer; it triggers the human-handoff path.

### Knowledge

The initial source is the existing Alphi website. The code will store approved, curated business facts in a dedicated knowledge module/document rather than scrape the public website on every customer message. This makes answers deterministic, fast, and easy to review. Unknown or missing facts cause handoff.

## Configuration and secrets

Vercel environment variables:

- `WASSENGER_API_KEY`
- `WASSENGER_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `HANDOFF_AGENT_ID` or `HANDOFF_DEPARTMENT_ID`
- durable-store configuration when moving beyond a private test

No secret is committed, logged, or returned by the endpoint. The existing local Wassenger MCP credential is not copied into the repository.

## Testing and go-live

1. Unit test signature verification, filters, duplicate handling, prompt routing, and handoff decisions.
2. Deploy a Vercel preview and send a private inbound WhatsApp test.
3. Verify exactly one reply for an approved FAQ, and a human handoff for a sensitive or unknown request.
4. Configure the production webhook in Wassenger only after the preview succeeds.
5. Keep a per-chat `bot:off` label as the immediate kill switch.

## Out of scope for the first version

- Outbound campaigns and unsolicited messaging.
- Prices, payments, refunds, order commitments, or booking commitments.
- CRM writes or customer-data collection.
- Audio/image support; text only for the initial test.
