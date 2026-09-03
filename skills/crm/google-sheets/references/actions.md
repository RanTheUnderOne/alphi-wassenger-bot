# Google Sheets Composio actions

Verified documented actions:

- `GOOGLESHEETS_VALUES_GET` — read a range.
- `GOOGLESHEETS_BATCH_GET` — read multiple ranges.
- `GOOGLESHEETS_VALUES_UPDATE` — update one range; omit
  `first_cell_location` to append rows.
- `GOOGLESHEETS_UPDATE_VALUES_BATCH` — update multiple ranges.
- `GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND` — append rows.

Required write inputs include the tenant's spreadsheet ID, worksheet name, and
values. Use A1 notation only where the action schema requests it. Read the
target range after every approved write.

Never use Google Sheets SQL `INSERT`, `UPDATE`, or `DELETE` as a bypass around
the approval and read-back policy.
