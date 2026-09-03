# Environment Variables — Alfi Master Agent

Secrets live here (`.env` / platform env), never in `config.yaml`.
Set these before starting Alfi.

| Variable | Required | Purpose |
|---|---|---|
| `WASSENGER_API_KEY` | ✅ | Wassenger API key for the Wassenger MCP (WhatsApp Business API). Get it at https://app.wassenger.com/api |
| `AGENT37_MANAGED_TOKEN` | ✅ (on Agent37) | Rotating per-instance token. Injected automatically by the Agent37 platform — do not hardcode. |
| `AGENT37_COMPOSIO_MCP_URL` | ✅ (on Agent37) | Managed Composio MCP endpoint. Injected automatically by the Agent37 platform. |

## Notes

- **Wassenger MCP** (`https://api.wassenger.com/mcp?key=${WASSENGER_API_KEY}`) — HTTP streaming, no local install. The key is passed in the URL via the `${WASSENGER_API_KEY}` reference.
- **Composio MCP** (`${AGENT37_COMPOSIO_MCP_URL}`) — powers Fireberry (CRM), Gmail, and the rest of the app catalog. When Alfi runs on Agent37 this is auto-provisioned; when self-hosting, replace it with your own Composio endpoint + key.
- **Never commit real values.** Keep this file as the single source of truth for which variables are required; actual secrets go into the platform/`.env`, which is git-ignored.
