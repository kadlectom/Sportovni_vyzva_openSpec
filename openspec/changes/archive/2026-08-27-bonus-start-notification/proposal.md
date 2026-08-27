## Why

Uživatelé potřebují v kanálu vidět, že dnes začíná časově omezené bonusové pravidlo, včetně podmínky, odměny a výzvy, ke které se vztahuje. Tato notifikace již existuje v aplikaci, ale její skutečné chování a rozdíly proti původnímu návrhu dosud nejsou zachyceny v OpenSpec.

## What Changes

- Dokumentuje denní kanálovou zprávu pro bonusová pravidla, jejichž `windowStart` odpovídá dnešnímu UTC datu a jejichž výzva je `ACTIVE`.
- Dokumentuje formát zprávy s názvem pravidla, podmínkou, odměnou v kilometrech a odkazem na detail výzvy.
- Dokumentuje podporu podmínek s filtrovanými katalogovými aktivitami, rozsahem dat a dny v týdnu.
- Dokumentuje idempotenci přes `notification_log` podle typu `bonus_start` a ID bonusového pravidla.
- Dokumentuje řízené chování při chybě Slacku, chybějící konfiguraci a konkurenčním doručení.

### Ověřené odchylky od NAVRH_Slack_notifikace.md

- `windowStart = null` se v tomto denním cronu nevybírá; žádný zvláštní trigger při přechodu `DRAFT → ACTIVE` v této implementaci není.
- Více bonusů začínajících stejný den se neslučuje; kód posílá jednu Slack zprávu pro každé pravidlo.
- Bonus přidaný s `windowStart` v minulosti se zpětně neodešle, protože výběr vyžaduje přesnou shodu s dnešním datem.
- Návrh uvádí cron kolem 08:30, ale aktuální route propouští pražskou hodinu 09 a `vercel.json` plánuje `07:00` a `08:00` UTC, aby jeden běh odpovídal 09:00 lokálně podle CET/CEST.

## Capabilities

### New Capabilities

- `slack-bonus-start-notification`: Kanálová Slack notifikace oznamující začátek bonusových pravidel v aktivních výzvách.

### Modified Capabilities

- Žádné.

## Impact

Dotčené existující části jsou `lib/notifications/bonusStart.ts`, `lib/notifications/format.ts`, `pages/api/cron/daily-bonus-announce.ts` a `vercel.json`. Implementace používá existující `sendSlackChannel`, `formatBonusCondition`, `notificationLog`, `CRON_SECRET` a `SLACK_CHANNEL_ID`; nepřidává runtime závislosti ani nemění bonusový datový model. Jde o retroaktivní dokumentaci, nikoli o nový implementační úkol.
