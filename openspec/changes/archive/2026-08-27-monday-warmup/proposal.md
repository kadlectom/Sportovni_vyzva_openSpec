## Why

Tým potřebuje lehký pondělní impuls, který po víkendu připomene společný progres bez tlaku na individuální pořadí. Stávající weekly-stats základ a Slack infrastruktura umožňují posílat konzistentní rekapitulaci aktivní výzvy; tato změna ji zachycuje jako hotovou TIER 1 capability.

## What Changes

- Přidává pondělní kanálovou Slack notifikaci „Pondělní rozcvička“ pro každou aktivní výzvu s aktivitou v posledních sedmi dnech.
- Přidává samostatnou selekci a renderování pondělních šablon včetně prioritní milestone varianty a výchozího týmového souhrnu.
- Využívá agregované týdenní statistiky, týmové součty a existující Slack channel helper.
- Zajišťuje idempotenci odeslání přes `notification_log` pro kombinaci výzvy a ISO týdne.
- Přidává chráněný cron endpoint `/api/cron/monday-summary` s kontrolou časového okna v časové zóně Europe/Prague.
- Registruje cron v `vercel.json` v UTC časech pokrývajících 08:30 v Praze během CET i CEST.
- Přidává unit testy pro výběr a renderování pondělních šablon.

## Capabilities

### New Capabilities

- `slack-monday-warmup`: Pondělní Slack kanálová rekapitulace aktivních sportovních výzev s výběrem motivační šablony a idempotentním doručením.

### Modified Capabilities

- Žádné.

## Impact

Dotčené části jsou `lib/notifications/mondaySummary.ts`, `lib/notifications/mondayTemplate.ts`, `pages/api/cron/monday-summary.ts`, `vercel.json` a testy v `__tests__/lib/notifications/mondayTemplate.test.ts`. Řešení používá existující `getWeeklyStats`, `sendSlackChannel`, `notificationLog`, `CRON_SECRET`, `SLACK_CHANNEL_ID` a pražskou časovou logiku; nepřidává nové runtime závislosti ani nemění veřejné uživatelské API.

Tento proposal je retroaktivní záznam již implementované a ověřené změny. `npm test` i `npm run build` již úspěšně prošly.
