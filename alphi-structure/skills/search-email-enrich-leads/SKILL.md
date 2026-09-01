---
name: search-email-enrich-leads
description: Scan Gmail against Fireberry. Match sender emails to leads, detect what changed, write a Hebrew note on the account when something is new, and propose the next action to the manager in chat. Does not send email.
---

# Search email and enrich leads

Talk to the **manager** in Alphi chat. Never send or reply to customer email. This is not the customer WhatsApp bot.

Timezone `Asia/Jerusalem`. **Hebrew only** for CRM fields, notes, and the manager report.

Mailbox: connected Gmail (Composio). Account alias `gmail_manny-breme` unless another mailbox is named.

A lead in Fireberry **Customers** (`לקוחות`) is an **Account**, not a Contact. Link the contact with `accountid`. Match on **email**, not phone.

Do not run the WhatsApp skill. Do not read WhatsApp.

## When to run

Triggers (Hebrew): «סרוק אימייל» / «סרוק מייל» / «תמיין לידים מאימייל» / «עדכן לידים מאימייל».

1. Load **accounts** (`FIREBERRY_GET_ALL_ACCOUNTS3`) and **contacts**.
2. Load Gmail threads — including a sender that was not in CRM before.
3. Match sender email ↔ account / contact `emailaddress1` (also `emailaddress2` / `emailaddress3`).
4. Detect change (new inbound, unread, waiting on us).
5. **If something is new** — create a new note on the account timeline (Notes tab). No change → no note.
6. **Propose card-field changes in chat.** Do not email the customer. Do not overwrite card fields without «תכניס» / «עדכן». Notes on new events are written in the same run (no approval).

If nothing changed — one line: אין עדכון, נסרקו N שרשורים.

## Workflow

1. Gmail: `GMAIL_FETCH_EMAILS` with `verbose: false`, `include_payload: false`. Query default: `in:inbox -in:spam -in:trash -category:promotions -category:social newer_than:7d`. Also fetch `is:unread in:inbox` if that query missed unread older than 7 days. Paginate `page_token` until done or a hard cap of 100 threads per run (say so if capped). Sort by `internalDate` / `messageTimestamp` client-side.
2. Skip: the owner’s own address as the only party, `noreply@`, `no-reply@`, `mailer-daemon`, newsletters, receipts, 2FA codes. Skip `CATEGORY_PROMOTIONS` / `CATEGORY_SOCIAL` unless the manager asked to include them.
3. Fireberry: `FIREBERRY_GET_ALL_ACCOUNTS3` and `FIREBERRY_GET_ALL_CONTACTS` (paginate until done).
4. Normalize emails (see reference). Sender missing from CRM = **surprise**. Propose creating an **account** as a lead (`statuscode` 6). Do not create until approval.
5. For changed / unread / new senders: `GMAIL_FETCH_MESSAGE_BY_THREAD_ID` (or `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID` `format: metadata` then `full` only if the body is needed for a name or stage). Newest inbound vs newest outbound decides who is waiting.
6. Stage (Hebrew): `פנייה ראשונית` | `ממתין למענה מנהל` | `שיחה פתוחה` | `לא ליד מכירות`.
7. Card fields wait for «תכניס». Existing account: write the note immediately. New lead with no card: first note together with create, after approval.

After field approval — account: `FIREBERRY_CREATE_AN_ACCOUNT` / `FIREBERRY_UPDATE_ACCOUNT` with `emailaddress1`. Contact: `firstname` required, plus `emailaddress1`, `jobtitle`, `department` (`לידים מאימייל`), `lastactiondate`, `description`, `accountid`. Do not invent phone or company.

Fireberry has no email lead-source picklist. Use `originatingleadcode` `1` (אינטרנט) and always write `מקור: אימייל` in `description` and notes.

## Lead name (from email)

The Fireberry **customer name** (`accountname`) and contact `firstname`/`lastname` must be the **person’s name from the email**, never a placeholder.

Forbidden: `New customer`, `ליד`, `ליד אימייל`, `ליד חדש`, the raw email as the display name, or any invented label.

How to get the name (in order):

1. From header display name (`From: ליאל כהן <lial@…>` → `ליאל כהן`). Treat as missing if it is only the local-part, a company noreply string, or **equals the mailbox owner’s name**.
2. Signature / body («קוראים לי…», «בברכה, דני»).
3. Still unknown: `ללא שם` + the email local-part (the bit before `@`) for uniqueness. Tell the manager the email name is missing. Never write «ליד אימייל».

When CRM still has a placeholder and email now has a real name — update `accountname` and the contact name in the same run (name fix, no «תכניס» wait).

Use that name everywhere: manager report, notes, `accountname`, contact name.

If the same person already exists from WhatsApp (same email, or manager says it is the same) — **update that account**. Do not create a second customer.

## Notes on the account timeline

**This skill writes only הערה** on the account (`objecttypecode` `1`). Same rules as the WhatsApp skill.

`FIREBERRY_CREATE_A_NOTE`: `objectid` = `accountid`, `objecttypecode` = `1`, `notetext` in Hebrew.

Each **new** event = a **new** note. Never edit a previous note. Never repeat the same fact.

New = unseen sender, new inbound, unread went up, stage change, lead created, status change. No change = no note.

Note body:

```
סריקת אימייל — תאריך
מה קרה (משפט אחד, כולל נושא המייל)
פעולה הבאה: …
```

After creating an account — always add that first note on the same card.

Account `statuscode`: `6` חדש, `9` בתהליך, `2` לקוח פעיל, `5` לא פעיל, `10` סגור - לא רלוונטי. Type: `accounttypecode` `3` אדם פרטי unless the From domain is clearly a company (then `4` חברה and use the person name still on the contact).

Personal / automated mail — not sales leads.

Do not mark Gmail read, archive, or label unless the manager asked.

## Manager chat (Hebrew)

```
סריקת אימייל — תאריך, שעה ישראל
נסרקו: N שרשורים | M לידים ב-CRM

חדשים (שולח שלא היה)
1. שם | אימייל — פעולה מוצעת: להכניס ל-CRM כליד חדש

השתנה המצב
1. שם | אימייל | שלב קודם → שלב עכשיו | למה | פעולה מוצעת

צריכים אותך עכשיו
1. שם | אימייל | למה | פעולה מוצעת
```

Proposed action is one Hebrew sentence: «לחזור היום» / «להכניס ל-CRM» / «לעדכן שלב ל…» / «לא למעקב מכירות».

Never send, reply, or forward Gmail to a customer (`GMAIL_SEND_EMAIL` and reply tools are out of scope).

## Tools

Gmail: `GMAIL_FETCH_EMAILS`, `GMAIL_LIST_THREADS`, `GMAIL_FETCH_MESSAGE_BY_THREAD_ID`, `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID`. Pass Composio account `gmail_manny-breme` when required.

Fireberry: `FIREBERRY_GET_ALL_ACCOUNTS3`, `FIREBERRY_CREATE_AN_ACCOUNT`, `FIREBERRY_UPDATE_ACCOUNT`, `FIREBERRY_GET_ALL_CONTACTS`, `FIREBERRY_CREATE_A_NOTE` on account (`objecttypecode` 1), `FIREBERRY_QUERY_RECORDS` module `"1"` / `"2"`. Card fields after approval; notes on new events in the same run.

If one side fails — report it. Do not invent data.
