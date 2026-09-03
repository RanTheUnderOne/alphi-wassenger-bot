# Monday Composio actions

Verified documented actions:

- `MONDAY_CREATE_ITEM` — create an item on a selected board.
- `MONDAY_CREATE_UPDATE` — create an update on a verified item or reply to an
  existing update.

Discovery required before enabling:

- Board, group, lead, task, phone, email, owner, and stage column IDs.
- Item search and column update action schemas for the connected toolkit.
- Read-back query action for items and updates.

An item is not a CRM lead until tenant configuration maps its board and fields.
Every mutation needs explicit owner approval.
