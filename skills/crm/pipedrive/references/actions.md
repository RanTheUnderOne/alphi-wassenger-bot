# Pipedrive Composio actions

Verified documented actions:

- `PIPEDRIVE_ADD_NOTE` — attach a note to a deal, person, organization, lead,
  or project. At least one verified entity ID is required.
- `PIPEDRIVE_ADD_TASK` — create a follow-up activity/task.
- Pipedrive toolkit documentation includes person, deal, and pipeline
  operations. Inspect the current connected-tool schema before calling a slug.

Do not use deprecated note actions. Discover tenant pipeline/stage IDs, custom
fields, and the exact connected-tool schemas before enabling writes. Every
write requires owner approval and a read-back.
