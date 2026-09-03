# Alphi master-agent skills: design

## Goal

Give the **manager-facing master agent** a small WhatsApp worker bundle. The owner talks to Alphi. Alphi reads the business WhatsApp inbox, briefs in Hebrew, and writes work into other apps. It does not answer customers.

Customer chat stays in the existing Wassenger webhook bot (`api/wassenger/webhook.ts`). That path is out of scope for these skills.

## Users and channel

- **User:** Israeli SMB owner/manager.
- **Interface:** Hermes/Alphi master chat (dashboard or owner WhatsApp to the master profile).
- **Inbox:** Wassenger MCP on the connected business number.
- **Hands:** Composio (Google Sheets first). CRM later.

## Israel defaults

- Timezone `Asia/Jerusalem`.
- Briefings in Hebrew unless the manager writes in English.
- Work week Sunday–Thursday. Flag Friday afternoon and Saturday as after-hours unless the manager says otherwise.
- Normalize phones: `05X…` → `+9725X…`.
- Treat WhatsApp as the CRM. Do not assume HubSpot.

## Skill bundle (v1)

Lives in `alphi-structure/skills/`. CRM is **Fireberry** (Composio), not Sheets.

| Skill | Job |
|---|---|
| `search-whatsapp-enrich-leads` | Scan WhatsApp, create missing Fireberry contacts, suggest updates for existing, attention list in owner chat. |

Later (not v1): calendar booking, invoice/VAT, campaigns, customer-facing replies.

## Shift contract (`alphi-inbox-worker`)

On “עבוד לי את הוואטסאפ” / “work my WhatsApp” / morning briefing:

1. Pull unread + recent 1:1 chats (ignore groups unless asked).
2. Classify: new number, unanswered >24h, price/quote intent, angry, already labeled `human` / `bot:off`.
3. Return a short Hebrew briefing with counts and a ranked list (name/phone, why it matters, suggested next step).
4. If Sheets is connected: append **new** leads only (dedupe by phone). Columns: `date, phone, name, last_message, tag, next_step`.
5. Draft follow-up texts for the top 5. Show drafts. Do not send until explicit confirm per chat.

## Hard rules

- Never use customer-bot prompts or the webhook reply path.
- Never blast, never campaigns in v1.
- Never invent prices, legal/medical advice, or “I already messaged them.”
- Confirm before any outbound WhatsApp to a customer.
- Confirm before deleting labels or assigning chats away from a human.

## Tools

- Wassenger MCP: chats, unread, messages, analysis, labels. Send only after confirm.
- Composio: Google Sheets append/read for the lead sheet.

## Success

Manager can say one sentence and get a usable Israeli inbox briefing plus Sheet updates, with zero unsolicited customer messages.
