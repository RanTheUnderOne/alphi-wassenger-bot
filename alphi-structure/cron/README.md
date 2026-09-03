# Alphi Cron Jobs & Routines

This directory defines the automated schedules and recurring routines for Alfi (the Master Agent).
These jobs run autonomously via Hermes Cron and deliver action items directly to the business owner.

## Jobs Overview

| Job Name | Schedule | Skills Used | Objective | Delivery Target |
|---|---|---|---|---|
| `morning-sales-review` | `0 8 * * 0-4` (Sun-Thu 08:00 IL) | `search-whatsapp-enrich-leads`, `search-email-enrich-leads` | Scan WhatsApp & Gmail for new/unanswered leads, cross-reference with Fireberry CRM, and deliver a unified briefing with actionable next steps. | `telegram` (Home Channel) |
| `evening-pipeline-audit` | `0 18 * * 0-4` (Sun-Thu 18:00 IL) | `search-whatsapp-enrich-leads`, `search-email-enrich-leads` | End-of-day check: identify leads still waiting for reply, summarize daily inbound, flag pending approvals. | `telegram` (Home Channel) |

---

## 1. Morning Sales Review (`morning-sales-review`)
- **When:** Every business day at 08:00 AM (Israel Time).
- **Core Mission:**
  1. Inspect incoming WhatsApp chats via Wassenger MCP.
  2. Inspect incoming Gmail threads via Composio.
  3. Match contacts and deduplicate across phone numbers and email addresses.
  4. Query Fireberry CRM to verify if contact/account already exists and check current deal status.
  5. Format output following Alfi's SOUL:
     - **Summary:** Total inbound items found.
     - **Urgent / Unanswered:** Leads requiring immediate callback/response today.
     - **CRM Status:** Existing accounts updated vs. new prospective leads.
     - **Proposed Actions (Pending Approval):** Numbered list of concrete actions for the owner to approve (e.g. `[1] Create Fireberry lead for X`, `[2] Update deal stage for Y`).
  6. Deliver to owner's Telegram channel. Never message end customers directly.
