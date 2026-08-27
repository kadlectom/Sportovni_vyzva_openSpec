## Why

Páteční kanálová rekapitulace pomáhá týmu uzavřít týden společným přehledem aktivity, kilometrů, zapojených lidí a dosažených bonusů bez běžného individuálního žebříčku. Funkce již existuje v aplikaci, ale její skutečné chování a logika šesti šablon dosud nejsou zachyceny v OpenSpec.

## What Changes

- Dokumentuje páteční Slack kanálovou zprávu pro každou aktivní výzvu s aktivitou v posledních sedmi dnech.
- Dokumentuje týdenní statistiky, týmové součty, porovnání s předchozím týdnem, pestrost, první výskyty aktivit, bonusy a nejaktivnější den.
- Dokumentuje šest skutečných šablon A–F: obecné shrnutí, pestrost, momentum, milestone, bonusy a rytmus týdne.
- Dokumentuje výběr milestone šablony s absolutní prioritou a rotaci ostatních způsobilých šablon podle ISO týdne.
- Dokumentuje idempotenci přes `notification_log` pro kombinaci výzvy a ISO týdne.
- Dokumentuje chráněný páteční cron endpoint s pražským časovým gate a UTC rozvrhem pro CET/CEST.

### Odchylky od NAVRH_Slack_notifikace.md

- Původní položka #6 popisuje šablony E1–E4 „Páteční předehry“; skutečný `weeklyTemplate.ts` má šablony A–F jako páteční ohlédnutí.
- Skutečný kód nemá fáze výzvy, podmínku minimálně 2 dnů do konce ani samostatnou šablonu „poslední víkend“.
- Šablona D má vždy prioritu, pokud je dostupný `nearestMilestone`; jinak se způsobilé A/B/C/E/F vybírají rotací podle `weekIndex % eligible.length`.
- Více aktivních výzev se zpracovává odděleně a každá dostane vlastní zprávu.

## Capabilities

### New Capabilities

- `slack-friday-weekly-summary`: Páteční kanálová rekapitulace týmového pohybu s prioritní milestone a rotujícími statistickými šablonami.

### Modified Capabilities

- Žádné.

## Impact

Dotčené existující části jsou `lib/notifications/weeklySummary.ts`, `lib/notifications/weeklyTemplate.ts`, `pages/api/cron/weekly-summary.ts` a `vercel.json`. Implementace používá existující `getWeeklyStats`, `sendSlackChannel`, `notificationLog`, `CRON_SECRET` a `SLACK_CHANNEL_ID`; nepřidává runtime závislosti ani nemění datový model. Jde o retroaktivní dokumentaci, nikoli o nový implementační úkol.
