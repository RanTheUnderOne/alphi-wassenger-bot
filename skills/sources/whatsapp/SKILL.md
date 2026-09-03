---
name: source-whatsapp
description: Read business WhatsApp and return normalized lead events.
version: 0.1.0
author: Ran (RanTheUnderOne), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [whatsapp, inbound, leads, source]
    related_skills: [lead-triage, crm-fireberry, wassenger-mcp]
---

# WhatsApp source

Read WhatsApp and return normalized inbound lead events to a business workflow.
Never call CRM tools or contact a customer. The customer bot is a separate app.

Timezone `Asia/Jerusalem`. **Hebrew only** for CRM fields, notes, and the manager report.

## When to run

Triggers (Hebrew): «סרוק וואטסאפ» / «תמיין כלידים» / «עדכן לידים».

1. Load WhatsApp chats and messages.
2. Detect new inbound, unread, changed, and waiting-on-business conversations.
3. Return normalized events to the calling business workflow.
4. Do not access or mutate CRM data.

## Workflow

1. `get_whatsapp_devices` — `operative` + `online`. Pass `device` on later WhatsApp calls. Never `sortBy` / `sortOrder`.
2. WhatsApp: `get_whatsapp_unread_chats` and `get_whatsapp_chats` `recent` + `by_contact_type` `chat`. Skip `@g.us`, the business number, personal chats, and bot tests.
3. For changed, unread, or new chats: `get_whatsapp_chat_messages` `recent`. `flow` = inbound/outbound.
4. Return facts: normalized phone, display name and confidence, chat ID, timestamps, latest-message direction, factual summary, and supporting message IDs.

## Identity extraction

Resolve a display name in this order:

1. Chat/contact `name`, `contact.name`, or `contact.displayName`. Treat a
   number, a phone-like name, or the business owner's name as missing.
2. A name explicitly stated in the chat or used in an outbound greeting.
3. Otherwise return no name and identify the lead only by normalized phone.

## Output

```text
{
  "source": "whatsapp",
  "eventType": "new_inbound | unread | waiting_on_business | changed",
  "occurredAt": "<ISO-8601>",
  "identity": { "name": null, "phone": "+972...", "nameConfidence": "missing" },
  "conversation": { "chatId": "<wid>", "lastInboundAt": "<ISO-8601>", "lastOutboundAt": "<ISO-8601>" },
  "summary": "<facts only>",
  "evidence": ["<message IDs or timestamps>"]
}
```

## Tools

Wassenger: `get_whatsapp_devices`, `get_whatsapp_unread_chats`,
`get_whatsapp_chats` (`includeContact: true`), `get_whatsapp_chat_by_id`, and
`get_whatsapp_chat_messages`.

Never call `send_whatsapp_message` from this source. If a business workflow
needs an inbox operation, it must use `wassenger-inbox` and follow its safety
guard.
