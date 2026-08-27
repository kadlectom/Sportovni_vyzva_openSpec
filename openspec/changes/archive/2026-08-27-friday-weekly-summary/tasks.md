## 1. Weekly data and delivery

- [x] 1.1 Zdokumentovat zpracování aktivních výzev a rolling okno posledních sedmi dnů se zkrácením na začátek výzvy; ověřeno `lib/notifications/weeklySummary.ts`.
- [x] 1.2 Zdokumentovat přeskočení výzev bez aktivity a samostatné zpracování více aktivních výzev; ověřeno iterací přes `activeChallenges` a kontrolou `stats.activityCount`.
- [x] 1.3 Zdokumentovat Slack channel delivery, výsledek `sent/skipped/failed` a odolnost vůči chybám; ověřeno `sendSlackChannel` a obsluhou výsledku v `weeklySummary.ts`.

## 2. Šablony a výběrová logika

- [x] 2.1 Zdokumentovat šest skutečných variant A–F místo návrhových E1–E4; ověřeno typem `TemplateId`, pool konfigurací a renderery v `weeklyTemplate.ts`.
- [x] 2.2 Zdokumentovat eligibility podmínky A/B/C/D/E/F a fallback na A; ověřeno `isEligible` a `selectTemplate`.
- [x] 2.3 Zdokumentovat absolutní prioritu D při `nearestMilestone`; ověřeno testem `D always wins when nearestMilestone is set`.
- [x] 2.4 Zdokumentovat rotaci pouze mezi způsobilými A/B/C/E/F podle `weekIndex % eligible.length`; ověřeno testy rotace a přeskočení nezpůsobilých variant.
- [x] 2.5 Zdokumentovat obsah rendererů včetně neutrálního momentum framingu, milestone stavů a škálování bonusového souhrnu; ověřeno renderovacími testy v `weeklyTemplate.test.ts`.

## 3. Cron, idempotence a retroaktivní dokumentace

- [x] 3.1 Zdokumentovat log-first idempotenci per challenge + ISO week; ověřeno `weekly_summary`, refId a unikátní constraint `notification_log`.
- [x] 3.2 Zdokumentovat cron autentizaci, pražskou hodinu 14, ruční trigger a UTC sloty `12:00`/`13:00`; ověřeno route a `vercel.json`.
- [x] 3.3 Vytvořit proposal, design, delta spec a tento checklist bez změny runtime kódu; ověřeno kompletním OpenSpec statusem po vytvoření artifacts.
