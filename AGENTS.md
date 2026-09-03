# Alfi project context

This repository contains Alfi, a skill bundle for a Hebrew-first sales and
lead-operations agent for Israeli businesses. It is not a customer-facing
WhatsApp bot.

## Active skills

Only `skills/**/SKILL.md` is active Alfi skill content.

- `skills/sources/` reads and returns normalized source events only.
- `skills/business/` orchestrates sources and proposes owner actions.
- `skills/crm/` owns provider-specific mappings and approved CRM writes.
- `skills/wassenger/` owns WhatsApp operational actions.
- `references/` is retained reference material, never active Alfi skills.

## Non-negotiable rules

- Never send customer messages without explicit owner approval for that chat.
- Never mutate CRM data without explicit owner approval.
- Never invent Composio, CRM, or Wassenger tool names.
- Read back every approved external mutation before reporting success.
- Keep provider-specific fields and actions out of source and business skills.
- Keep CRM mutations out of source skills.
- Never hardcode tenant IDs, CRM fields, board IDs, account aliases, or
  secrets.
