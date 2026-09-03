# מבנה אלפי

צד הרמס של אלפי: נשמה (`SOUL.md`), חבילות סקילים, ושגרות קרון אוטומטיות (`cron/`). לא בוט הוואטסאפ ללקוחות.

## רכיבי המערכת

| רכיב | מיקום | תפקיד |
|---|---|---|
| **SOUL** | `SOUL.md` | הגדרת התפקיד, סגנון התקשורת והקווים האדומים (Guardrails) של אלפי כעובד דיגיטלי. |
| **סריקת וואטסאפ** | `skills/search-whatsapp-enrich-leads` | סריקת וואטסאפ, התאמת לידים כלקוחות בפיירברי, רשימת תשומת לב למנהל. |
| **סריקת אימייל** | `skills/search-email-enrich-leads` | סריקת Gmail, התאמה ומניעת כפילויות מול לידים קיימים בפיירברי. |
| **שגרות עבודה (Cron)** | `cron/` | סקירת בוקר (`morning-sales-review`) וביקורת ערב לתפעול שוטף מול המנהל. |

### סקילי Wassenger ייעודיים (תשתית WhatsApp Business רשמית)

| סקיל | תפקיד |
|---|---|
| `skills/wassenger-inbox` | ניהול תור השיחות, סטטוסים, הערות פנימיות בשיחה וטריאז'. |
| `skills/wassenger-labels` | תיוג חכם של שיחות (`stage:lead`, `priority:urgent`) למעקב ומחקר. |
| `skills/wassenger-sales-bot` | הכשרת לידים, סקוונסים של פולואפ, מענה מובנה והעברה לנציג אנושי. |
| `skills/wassenger-quick-replies` | ניהול תבניות מענה מהיר ושימוש בתשובות מוכנות. |
| `skills/wassenger-messaging` | שליחת הודעות, תבניות WABA, מדיה וסקרים בהתאם לכללי 24 השעות. |
| `skills/wassenger-mcp` | מפרט הכלים והאינטגרציה המלא של שרת ה-MCP של Wassenger. |

### שרתי MCP נדרשים (קונפיגורציה)

| שרת MCP | שירות | מקור |
|---|---|---|
| `wassenger` | WhatsApp Business API (WABA) | `https://api.wassenger.com/mcp?key=${WASSENGER_API_KEY}` |
| `composio` | Fireberry (CRM), Gmail ו-250+ אפליקציות | `${AGENT37_COMPOSIO_MCP_URL}` (מנוהל ע"י Agent37) |

הגדרות מלאות: `config.yaml`. משתני הסביבה הנדרשים: `ENVIRONMENT.md`.

CRM: פיירברי דרך Composio (לקוחות = לידים במסך לקוחות; אנשי קשר מקושרים). וואטסאפ: Wassenger MCP. אימייל: Gmail דרך Composio.

הפלט למנהל ול-CRM הוא בעברית.
