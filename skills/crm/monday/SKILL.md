---
name: crm-monday
description: Use Monday boards through the Alfi CRM capability contract.
version: 0.1.0
author: Ran (RanTheUnderOne), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [crm, monday, composio, leads]
    related_skills: [lead-triage]
---

# Monday CRM adapter

Map Alfi lead operations to a tenant-selected Monday board. Monday is a
configurable work-management system, not a relational CRM.

## Procedure

1. Confirm the connected Monday account, selected board, group, and column
   mapping in tenant configuration.
2. Search configured phone/email columns before proposing a new item.
3. Treat a board item as a lead only after its board mapping is verified.
4. Use `MONDAY_CREATE_UPDATE` for an approved activity note on a verified item.
5. Propose all item and column mutations, then read back the item/update after
   owner approval.

## Capability limits

- Person matching, pipelines, lead creation, updates, and task handling are
  configurable per board.
- No contact/account relationship, stage, owner, or task field is assumed.
- A separate task board is required when tasks do not live on lead items.
