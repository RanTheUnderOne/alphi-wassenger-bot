# Alfi Skills

All directories under this folder are Agent Skills. Each skill must contain a `SKILL.md` file with valid YAML frontmatter.

## Skill types

- **Source skills:** `search-whatsapp-enrich-leads`, `search-email-enrich-leads`
- **Business workflows:** `follow-up-radar`, `voice-note-to-action`
- **Wassenger capabilities:** `wassenger-*`

## Loading

Hermes discovers skills from the configured skills directory. Skills are loaded progressively: description first, then full `SKILL.md` on demand. References are loaded only when needed.

## Rules

- Keep each skill focused on one capability.
- Put detailed material in that skill's `references/` directory.
- Keep provider-specific CRM behavior in `alphi-structure/crm/`.
- Keep customer messaging behind the approval rules in `SOUL.md`.
- Use exact MCP tool names from the relevant MCP reference skill; do not invent tools.

## Current skills

| Directory | Role |
|---|---|
| `search-whatsapp-enrich-leads` | WhatsApp source scan and lead enrichment |
| `search-email-enrich-leads` | Gmail source scan and lead enrichment |
| `follow-up-radar` | Detect leads requiring timely follow-up |
| `voice-note-to-action` | Convert owner voice notes to proposed CRM actions |
| `wassenger-inbox` | WhatsApp inbox triage |
| `wassenger-labels` | WhatsApp label management |
| `wassenger-messaging` | WhatsApp outbound messaging rules |
| `wassenger-quick-replies` | Canned reply library |
| `wassenger-sales-bot` | WhatsApp qualification and handoff recipes |
| `wassenger-mcp` | Wassenger MCP catalog and parameter reference |

The skill directory is the source of truth for this repository. Runtime installation/activation is handled separately by the target Hermes/Agent37 image.

## Validation (later)

Tests and Agent37 production smoke tests are intentionally deferred until the skill set and architecture are reviewed.
