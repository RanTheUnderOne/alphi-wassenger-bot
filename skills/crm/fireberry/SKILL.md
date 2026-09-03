---
name: crm-fireberry
description: Use Fireberry as Alfi's CRM provider through Composio.
version: 0.1.0
author: Alfi team, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [crm, fireberry, composio, leads]
    related_skills: [lead-triage, source-whatsapp, source-gmail]
---

# Fireberry CRM Adapter

This adapter translates Alfi's CRM Capability Contract into Fireberry operations through Composio. Business workflows must use the contract, not these provider-specific field names.

## When to Use

Use when tenant configuration selects `crm.provider: fireberry`.

## Prerequisites

- Active Fireberry connection through Composio.
- The tenant's Fireberry account selected by configuration, never guessed from a hardcoded alias.
- Read the Fireberry reference in `../CRM-CAPABILITY-CONTRACT.md` before any mutation.
- Use `references/whatsapp-fields.md` or `references/gmail-fields.md` only
  when translating an approved normalized source event into Fireberry fields.

## Normalized mapping

| Contract capability | Fireberry implementation |
|---|---|
| `find_person` | `FIREBERRY_QUERY_RECORDS` in Contacts module `"2"` by normalized phone/email |
| `find_lead` | `FIREBERRY_QUERY_RECORDS` in Customers/Accounts module `"1"` |
| `get_pipeline` | `FIREBERRY_QUERY_RECORDS` for Accounts with active statuses |
| `create_lead` | `FIREBERRY_CREATE_AN_ACCOUNT`, then `FIREBERRY_CREATE_A_CONTACT` |
| `update_lead` | `FIREBERRY_UPDATE_ACCOUNT` or `FIREBERRY_UPDATE_A_CONTACT` after approval |
| `add_note` | `FIREBERRY_CREATE_A_NOTE` on Account, `objecttypecode: "1"` |
| `create_task` | `FIREBERRY_CREATE_A_TASK` after approval |

## Fireberry rules

- A lead in Customers (`לקוחות`) is an Account, not a Contact.
- Link a Contact to its Account using `accountid`.
- Account status codes: `6` new, `9` in progress, `2` active customer, `5` inactive, `10` closed/not relevant.
- WhatsApp source: `originatingleadcode: 8`.
- Email source: `originatingleadcode: 1`, and write `source: email` in the note/description.
- Private person type: `accounttypecode: 3`; company: `4` only when clearly established.
- Never use placeholders such as `ליד וואטסאפ`, `ליד אימייל`, `New customer`, or a raw phone/email as the person's name.
- Notes belong on the Account timeline, not the Contact.

## Procedure

1. Resolve the active Fireberry connection and inspect required picklists with
   `FIREBERRY_GET_PICKLIST_VALUES` when a configured value is unknown.
2. Normalize the requested phone/email and run a targeted
   `FIREBERRY_QUERY_RECORDS`; do not load all Accounts or Contacts for a
   single lookup.
3. Return normalized candidates with matched fields and confidence.
4. For an unambiguous read, return the normalized person/lead object.
5. For a mutation, create a proposed action and wait for explicit approval.
6. Execute the exact provider operation only after approval.
7. Read back the target Account, Contact, Note, or Task and report the
   verified result.

## Pitfalls

- Do not duplicate an Account because phone and email arrived through different channels.
- Paginate only pipeline and bulk-report reads. Bound every page scan and
  report a partial result rather than silently stopping.
- Do not assume a Fireberry field exists in another CRM.
- Do not overwrite names, company, or stage from weak evidence.
- Do not report a write as successful without a read-back.

## Verification

The calling workflow must report the provider, target record, operation, and read-back result. If Fireberry does not expose a required capability, return `provider_error` or `not_supported` instead of inventing an equivalent.
