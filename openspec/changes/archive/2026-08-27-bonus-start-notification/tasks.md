## 1. Výběr a zpracování pravidel

- [x] 1.1 Zdokumentovat výběr bonusových pravidel podle přesné shody `windowStart = dnešní UTC datum` a `ACTIVE` challenge; ověřeno dotazem v `lib/notifications/bonusStart.ts`.
- [x] 1.2 Ověřit a zdokumentovat edge case `windowStart = null`; ověřeno skutečným filtrem `eq(bonusRules.windowStart, today)`, který hodnotu `null` nevybere.
- [x] 1.3 Ověřit a zdokumentovat edge case více bonusů ve stejný den; ověřeno iterací přes `pending`, která odesílá samostatnou zprávu pro každé pravidlo bez slučování.
- [x] 1.4 Ověřit a zdokumentovat zpětné odeslání bonusu s minulým datem; ověřeno přesnou shodou data, která historické `windowStart` nezpracuje.

## 2. Obsah a doručení

- [x] 2.1 Zdokumentovat formát kanálové zprávy s názvem bonusu, podmínkou, odměnou a odkazem na výzvu; ověřeno `formatBonusStartMessage` v `lib/notifications/format.ts`.
- [x] 2.2 Zdokumentovat formátování katalogových filtrů, datumového rozsahu a dnů v týdnu; ověřeno předáním hodnot do `formatBonusCondition`.
- [x] 2.3 Zdokumentovat Slack channel delivery a řízené zpracování chyb; ověřeno voláním `sendSlackChannel` a výsledkem `sent/skipped/failed`.

## 3. Idempotence, cron a dokumentace

- [x] 3.1 Zdokumentovat log-first idempotenci podle `bonus_start` + ID pravidla; ověřeno `notification_log`, unikátním constraintem a kontrolou existujících záznamů.
- [x] 3.2 Zdokumentovat cron autentizaci, pražskou hodinu 09 a dvojí UTC rozvrh `07:00`/`08:00`; ověřeno `daily-bonus-announce.ts` a `vercel.json`.
- [x] 3.3 Vytvořit proposal, design, delta spec a tento retroaktivní checklist bez změny runtime kódu; ověřeno kompletním OpenSpec statusem po vytvoření artifacts.
