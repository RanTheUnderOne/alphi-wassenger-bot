# Alfi skill bundle

Portable skill bundle for Alfi, a Hebrew-first sales and lead-operations agent
for Israeli businesses. It is not the customer-facing WhatsApp bot.

## Bundle structure

```text
alphi-structure/
├── SOUL.md                         # Identity, scope, and safety boundaries
├── config/
│   ├── mcp.yaml                    # MCP connection configuration
│   └── ENVIRONMENT.md              # Required environment variables
├── skills/
│   ├── sources/                    # Read and normalize source events
│   │   ├── whatsapp/
│   │   └── gmail/
│   ├── business/                   # Owner-facing business workflows
│   │   ├── lead-triage/
│   │   ├── morning-review/
│   │   ├── follow-up-radar/
│   │   └── voice-note-to-action/
│   ├── crm/                        # Provider-neutral contract and adapters
│   │   ├── CRM-CAPABILITY-CONTRACT.md
│   │   ├── fireberry/
│   │   ├── hubspot/
│   │   ├── pipedrive/
│   │   ├── monday/
│   │   └── google-sheets/
│   └── wassenger/                  # WhatsApp operational capabilities
│       ├── inbox/
│       ├── labels/
│       └── mcp/
├── references/
│   └── customer-facing-wassenger/  # Inactive reference material; not Alfi skills
├── cron/                           # Scheduled workflow definitions
└── runtime/                        # Installation and loading contract
```

## Layer rules

- `skills/sources/` reads systems and returns normalized events. It never writes
  CRM data or contacts customers.
- `skills/business/` combines source events with CRM capabilities, ranks work,
  and proposes actions for owner approval.
- `skills/crm/` owns CRM-specific fields, tools, mutations, deduplication, and
  read-back verification.
- `skills/wassenger/` owns Wassenger-specific operational actions. Customer
  messaging is out of scope for Alfi V1.

## CRM provider references

| Provider | Role | Capability status |
|---|---|---|
| Fireberry | Israeli CRM adapter | Verified Composio reference |
| HubSpot | CRM adapter | Contact/deal operations verified; notes/tasks need discovery |
| Pipedrive | CRM adapter | Person/deal/note/task reference |
| Monday | Configurable board adapter | Board/column mapping required |
| Google Sheets | Lightweight lead ledger | Worksheet schema and stable lead ID required |

Provider skills document Composio operations and their limits. They do not
assert that a tenant has connected the provider or configured its fields.
See [`skills/crm/CRM-CAPABILITY-CONTRACT.md`](skills/crm/CRM-CAPABILITY-CONTRACT.md)
for the provider-neutral capability matrix.

`references/customer-facing-wassenger/` contains retained Wassenger recipes for
customer bots. It is reference material only, outside `skills/`, and must not
be loaded as part of Alfi Master Agent V1.

## Installation

This repository is source code, not an automatically loaded runtime. See
[`runtime/README.md`](runtime/README.md) for the required installation or
external-directory registration step.
