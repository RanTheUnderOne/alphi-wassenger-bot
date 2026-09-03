---
name: crm-google-sheets
description: Use Google Sheets as a configurable Alfi lead ledger.
version: 0.1.0
author: Ran (RanTheUnderOne), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [crm, google-sheets, composio, leads]
    related_skills: [lead-triage]
---

# Google Sheets lead-ledger adapter

Use Google Sheets as a lightweight lead ledger through Composio. It is not a
relational CRM and must be configured before a business workflow uses it.

## Required tenant configuration

- `spreadsheetId`
- `leadsSheetName`
- Stable `leadId` column
- `phone`, `email`, `name`, `stage`, `updatedAt` columns
- Optional `notesSheetName` and `tasksSheetName`

## Procedure

1. Read headers and configured ranges with `GOOGLESHEETS_VALUES_GET`.
2. Search for normalized phone and email before proposing a create. Never
   deduplicate by name alone.
3. Use the stable `leadId` to target an approved update. Never identify a row
   by its current row number alone.
4. Use a dedicated notes/tasks sheet with `leadId`, action ID, timestamp, and
   content for append-only activities.
5. Execute approved writes with `GOOGLESHEETS_VALUES_UPDATE` or
   `GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND`, then read the target range back.

## Capability limits

- `find_person`, `find_lead`, `create_lead`, and `update_lead` are
  configurable through the leads-sheet schema.
- `get_pipeline` is available only when the configured sheet has a stage
  column.
- `add_note` and `create_task` need dedicated configured sheets.
- Concurrent writers can create duplicates. A lookup immediately before an
  approved append is mandatory.
