---
name: crm-pipedrive
description: Use Pipedrive through the Alfi CRM capability contract.
version: 0.1.0
author: Ran (RanTheUnderOne), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [crm, pipedrive, composio, leads]
    related_skills: [lead-triage]
---

# Pipedrive CRM adapter

Translate Alfi CRM capabilities into Pipedrive person, organization, deal, note,
and activity operations through Composio.

## Procedure

1. Confirm an active Pipedrive connection and inspect
   `references/actions.md`.
2. Search people by normalized phone/email before a proposed creation.
3. Resolve a person and organization before searching or proposing a deal.
4. Use the tenant's configured pipeline and stage IDs; never infer IDs from a
   stage label.
5. Propose every write, execute it only after explicit owner approval, then
   read it back.

## Guardrails

- A note or task must attach to a verified entity ID.
- Use the current non-deprecated note action.
- Missing tenant fields or unavailable actions return `discovery_required`;
  never replace them with another CRM operation.
