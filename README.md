# Alfi

Alfi is a Hebrew-first sales and lead-operations skill bundle for Israeli
businesses. It is not a customer-facing WhatsApp bot.

## Structure

```text
SOUL.md                 # Identity, scope, and safety boundaries
AGENTS.md               # Project rules loaded by Hermes in this repository
config/                 # Source MCP requirements and environment docs
skills/                 # Active Alfi Agent Skills
  sources/              # Read and normalize inbound events
  business/             # Owner-facing workflows and proposed actions
  crm/                  # Provider-neutral contract and CRM adapters
  wassenger/            # WhatsApp operational capabilities
references/             # Inactive customer-bot reference recipes
cron/                   # Scheduled workflow definitions
runtime/                # Runtime documentation
```

## Layer rules

- `skills/sources/` reads and normalizes events. It does not write CRM data or
  contact customers.
- `skills/business/` combines source events with CRM capabilities and proposes
  owner-approved actions.
- `skills/crm/` owns provider-specific fields, tool references, deduplication,
  approved writes, and read-back verification.
- `skills/wassenger/` owns WhatsApp operations. Customer messaging is outside
  Alfi V1.

## Provider references

CRM reference skills exist for Fireberry, HubSpot, Pipedrive, Monday, and
Google Sheets. They document provider capabilities; they do not assert that a
tenant connection or configuration exists.

Customer-facing Wassenger recipes remain in
`references/customer-facing-wassenger/`. They are not active Alfi skills.
