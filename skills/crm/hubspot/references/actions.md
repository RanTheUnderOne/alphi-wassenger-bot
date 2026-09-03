# HubSpot Composio actions

Verified documented actions:

- `HUBSPOT_CREATE_CONTACT` — create a contact.
- `HUBSPOT_SEARCH_CONTACTS_BY_CRITERIA` — search contacts; limit is at most
  100 per request.
- `HUBSPOT_LIST_CONTACTS_PAGE` — paginate contacts.
- HubSpot toolkit documentation includes deal list, create, update, and archive
  operations. Inspect the current connected-tool schema before calling a slug.

Discovery required before enabling:

- Create or update a note.
- Create or update a follow-up task.
- Tenant pipeline IDs, stage IDs, property names, associations, and duplicate
  policy.

All mutations need explicit owner approval and a read-back query.
