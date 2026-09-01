---
name: search-whatsapp-enrich-leads
description: Scan WhatsApp against Fireberry. Match phones to leads, detect what changed, write a Hebrew note on the account when something is new, and propose the next action to the manager in chat.
---

# Search WhatsApp and enrich leads

Talk to the **manager** in Alphi chat. Never reply to customers on WhatsApp. The customer bot is a separate app.

Timezone `Asia/Jerusalem`. **Hebrew only** for CRM fields, notes, and the manager report.

A lead in Fireberry **Customers** (`לקוחות`) is an **Account**, not a Contact. Link the contact with `accountid`.

## When to run

Triggers (Hebrew): «סרוק וואטסאפ» / «תמיין כלידים» / «עדכן לידים».

1. Load **accounts** (`FIREBERRY_GET_ALL_ACCOUNTS3`) and **contacts**.
2. Load WhatsApp numbers — including a number that was not there before.
3. Match phone ↔ account / contact.
4. Detect change (new message, unread, waiting on us).
5. **If something is new** — create a new note on the account timeline (Notes tab). No change → no note.
6. **Propose card-field changes in chat.** Do not message the customer. Do not overwrite card fields without «תכניס» / «עדכן». Notes on new events are written in the same run (no approval).

If nothing changed — one line: אין עדכון, נסרקו N מספרים.

## Workflow

1. `get_whatsapp_devices` — `operative` + `online`. Pass `device` on later WhatsApp calls. Never `sortBy` / `sortOrder`.
2. Fireberry: `FIREBERRY_GET_ALL_ACCOUNTS3` and `FIREBERRY_GET_ALL_CONTACTS` (paginate until done).
3. WhatsApp: `get_whatsapp_unread_chats` and `get_whatsapp_chats` `recent` + `by_contact_type` `chat`. Skip `@g.us` and the business’s own number.
4. Number missing from CRM = surprise. Propose creating an **account** as a lead (`statuscode` 6). Do not create until approval.
5. For changed / unread / new chats: `get_whatsapp_chat_messages` `recent`. `flow` = inbound/outbound.
6. Stage (Hebrew, write these strings): `פנייה ראשונית` | `ממתין למענה מנהל` | `שיחה פתוחה` | `לא ליד מכירות`.
7. Card fields wait for «תכניס». Existing account: write the note immediately. New lead with no card: first note together with create, after approval.

After field approval — account: `FIREBERRY_CREATE_AN_ACCOUNT` / `FIREBERRY_UPDATE_ACCOUNT`. Contact: `firstname` required, plus `jobtitle`, `department`, `lastactiondate`, `description`, `accountid`. Do not invent email or company.

## Notes on the account timeline

Customer card tabs: הערה, משימה, לוג שיחה, קובץ, פגישה, WhatsApp. **This skill writes only הערה.** Do not create tasks, meetings, files, or WhatsApp-tab items.

`FIREBERRY_CREATE_A_NOTE`:
- `objectid` = account `accountid`
- `objecttypecode` = `1` (account). Not `2` (contact) — the note will not show on the customer card
- `notetext` in Hebrew; short HTML is allowed

Each **new** event = a **new** note. Never edit a previous note. Never repeat the same fact.

New = unseen number, new message, unread went up, stage change, lead created, status change. No change = no note.

Note body:

```
סריקת וואטסאפ — תאריך
מה קרה (משפט אחד)
פעולה הבאה: …
```

After creating an account — always add that first note on the same card.

Account `statuscode` for views: `6` חדש (לידים חדשים), `9` בתהליך, `2` לקוח פעיל, `5` לא פעיל, `10` סגור - לא רלוונטי. Source WhatsApp: `originatingleadcode` 8 (ווטסאפ). Type: `accounttypecode` 3 אדם פרטי unless you know otherwise.

Personal chat / bot test — not sales leads.

## Manager chat (Hebrew)

```
סריקת וואטסאפ — תאריך, שעה ישראל
נסרקו: N וואטסאפ | M לידים ב-CRM

חדשים (מספר שלא היה)
1. שם/מספר — פעולה מוצעת: להכניס ל-CRM כליד חדש

השתנה המצב
1. שם | טלפון | שלב קודם → שלב עכשיו | למה | פעולה מוצעת

צריכים אותך עכשיו
1. שם | טלפון | למה | פעולה מוצעת
```

Proposed action is one Hebrew sentence: «לחזור היום» / «להכניס ל-CRM» / «לעדכן שלב ל…» / «לא למעקב מכירות».

Never `send_whatsapp_message` to a customer.

## Tools

Wassenger: `get_whatsapp_devices`, `get_whatsapp_unread_chats`, `get_whatsapp_chats`, `get_whatsapp_chat_messages`.

Fireberry: `FIREBERRY_GET_ALL_ACCOUNTS3`, `FIREBERRY_CREATE_AN_ACCOUNT`, `FIREBERRY_UPDATE_ACCOUNT`, `FIREBERRY_GET_ALL_CONTACTS`, `FIREBERRY_CREATE_A_NOTE` on account (`objecttypecode` 1), `FIREBERRY_QUERY_RECORDS` module `"1"` / `"2"`. Card fields after approval; notes on new events in the same run.

If one side fails — report it. Do not invent data.
