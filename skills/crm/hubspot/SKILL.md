---
name: crm-hubspot
description: Use HubSpot through the Alfi CRM capability contract.
version: 0.1.0
author: Ran (RanTheUnderOne), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [crm, hubspot, composio, leads]
    related_skills: [lead-triage]
---

# HubSpot CRM adapter

Translate Alfi CRM capabilities into HubSpot operations through Composio. Use
this only when tenant configuration selects `crm.provider: hubspot`.

## Procedure

1. Confirm an active HubSpot connection and inspect `references/actions.md`.
2. Search contacts by normalized phone/email before creating any record.
3. Search deals associated with an unambiguous contact before proposing a new
   deal. Paginate list/search operations and respect the documented 100-item
   page limit.
4. Map the tenant's configured pipeline and stage IDs. Never guess them from
   display names.
5. Propose every mutation, execute only after explicit owner approval, then
   read back the target record.

## Capability limits

- Contact and deal lookup/create/update are supported by documented Composio
  HubSpot operations.
- Notes and tasks are `discovery_required`: inspect the connected toolkit
  before offering them.
- Never use custom authenticated API calls as a silent fallback.
