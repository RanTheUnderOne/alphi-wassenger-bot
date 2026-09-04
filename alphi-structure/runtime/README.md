# Runtime installation

This repository is Alfi's source bundle. Hermes does not automatically load skills from arbitrary Git repositories.

## Recommended Agent37 setup

1. Clone this repository into the persistent `/home/node` volume.
2. Configure the Alfi Hermes profile's `skills.external_dirs` to point to:

```text
/home/node/alphi-wassenger-bot/alphi-structure/skills
```

3. Copy `alphi-structure/SOUL.md` to the target profile's `SOUL.md`.
4. Translate `config/mcp.yaml` into the target Hermes profile's native MCP configuration; this file is the source specification, not a claim that Hermes auto-loads it.
5. Add `WASSENGER_API_KEY` to the target profile's secret store. Agent37 supplies `AGENT37_MANAGED_TOKEN` and `AGENT37_COMPOSIO_MCP_URL` at runtime.
6. Start a new Hermes session so the skill index is rebuilt.

## Skill loading contract

The external skill directory is the canonical runtime bridge. Hermes scans each immediate category directory and discovers nested skill directories containing `SKILL.md`. The active skill names are taken from frontmatter, not from folder names.

The bundle contains these active skills:

- `source-whatsapp`
- `source-gmail`
- `lead-triage`
- `morning-review`
- `follow-up-radar`
- `voice-note-to-action`
- `crm-fireberry`
- `wassenger-inbox`
- `wassenger-labels`
- `wassenger-mcp`

Customer-facing Wassenger recipes are intentionally stored under `references/customer-facing-wassenger/` and are not part of the active skill directory.

## Configuration boundary

- `SOUL.md`: identity, voice, and guardrails.
- `config/mcp.yaml`: source specification for MCP servers.
- `config/ENVIRONMENT.md`: required secret names and runtime variables.
- `skills/`: agent-discoverable procedural skills.
- `references/`: inactive supporting material unless explicitly promoted into a skill.
- `cron/`: schedule documentation; live schedules are managed by Hermes Cron.

## Agent37 persistence

Only `/home/node` and `/home/linuxbrew` persist across restarts and image updates. `AGENT37_MANAGED_TOKEN` rotates; never copy its value into a persistent config. The post-restart hook may recreate runtime-only links or start services, but must reference environment variables rather than hardcoded tokens.

## Verification (run later)

1. Start a fresh Alfi session.
2. Run `hermes skills list` with the Alfi profile.
3. Confirm the ten local skills above are present and enabled.
4. Load `/morning-review` and confirm the skill references resolve.
5. Only then run read-only MCP checks. CRM mutations and customer messaging require explicit approval.

Production tests are intentionally deferred until the architecture review is complete.
