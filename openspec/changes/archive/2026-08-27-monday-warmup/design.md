## Context

Viz `proposal.md` pro motivaci a rozsah. Aplikace je brownfield Next.js Pages Router s existujícími agregacemi týdenních statistik, wrapperem pro Slack Web API, tabulkou `notification_log` a cron autentizací přes `CRON_SECRET`. Implementace je již nasazená v kódu a tento dokument zachycuje použitá technická rozhodnutí.

## Goals / Non-Goals

**Goals:**

- Poslat krátkou, motivační rekapitulaci do sdíleného Slack kanálu pro každou relevantní aktivní výzvu.
- Zachovat konzistentní výpočty pomocí existujícího weekly-stats základu.
- Nabídnout rotující pondělní šablony a dát milestone sdělení nejvyšší prioritu.
- Zajistit bezpečné opakování cron jobu bez duplicitního odeslání.
- Pokrýt čistý výběr a renderování šablon unit testy.

**Non-Goals:**

- Zavedení individuálních Slack DM, leaderboard pořadí nebo uživatelského opt-outu.
- Změna výpočtu bodů, statistických agregací nebo datového modelu výzev.
- Přidání nového Slack SDK či jiné runtime závislosti.
- Nahrazení stávajícího pátečního souhrnu.

## Decisions

### Sdílená weekly-statistics vrstva

Pondělní notifikace používá `getWeeklyStats` s rolling oknem posledních sedmi dnů, ohraničeným začátkem výzvy. Tím se zamezí duplicitní logice pro týmový součet, počet aktivit, zapojené uživatele, top aktivity, novinky a milestone stav. Alternativou by byly vlastní SQL dotazy v notifikační vrstvě, což by zvýšilo riziko rozdílných výsledků mezi UI a Slackem.

### Samostatná selekce a renderování šablon

`selectMondayTemplate` a `renderMondayTemplate` jsou oddělené od pátečních šablon. Milestone varianta `D` se vybírá jako prioritní; ostatní vhodné varianty `A` až `C` se rotují podle ISO týdne. Alternativou by byla jediná univerzální šablona, ta by ale neposkytla deklarovanou pestrost a milestone zvýraznění.

### Log-first idempotence

Před odesláním Slack zprávy se vloží záznam typu `monday_summary` s `refId` ve tvaru `<challengeId>:<isoWeek>` a `userId = null`. Unikátní constraint `(type, refId, userId)` zajistí, že retry nebo paralelní běh přeskočí již zpracovanou dvojici. Alternativou je kontrola existence následovaná insertem, která má race condition.

### Dvojí UTC cron registrace s pražským gate

`vercel.json` obsahuje pondělní běhy v `06:30` a `07:30` UTC. Handler propustí pouze běh, který odpovídá pražské hodině 08, takže 08:30 funguje při CET i CEST bez spoléhání na pevnou UTC hodnotu. Ruční trigger může časový gate přeskočit, což usnadňuje provozní testování.

### Existující Slack a cron hranice

Doručení deleguje na `sendSlackChannel`; endpoint používá `assertCronAuth` a vrací strukturovaný výsledek počtu pokusů, odeslání, přeskočení a selhání. Slack nebo databázová chyba nepropaguje broadcast jako neřízený pád celého cron běhu.

## Risks / Trade-offs

- [Doručení je závislé na `SLACK_CHANNEL_ID` a `SLACK_BOT_TOKEN`] → Chybějící konfigurace se bezpečně projeví jako přeskočení nebo řízené selhání; endpoint zůstává dostupný pro monitoring.
- [Log-first strategie může zapsat notifikaci i při následném selhání Slacku] → Opakovaný cron nebude zprávu duplikovat; případné nedoručení je viditelné ve výsledku a logu procesu.
- [Vercel crons běží v UTC a oba plánované běhy aktivují stejnou route] → Pražská časová kontrola propustí právě jeden relevantní běh v každém období CET/CEST.

## Migration Plan

1. Nasadit již přítomné změny spolu s konfigurací `SLACK_CHANNEL_ID`, `SLACK_BOT_TOKEN` a `CRON_SECRET`.
2. Ověřit autorizované ruční spuštění endpointu pomocí hlavičky `X-Manual-Trigger: 1` a zkontrolovat výsledek i Slack kanál.
3. Po nasazení sledovat cron výsledek a `notification_log`; rollback spočívá v odstranění cron registrací nebo návratu dotčeného release.

## Open Questions

Žádné. Technická rozhodnutí potřebná pro tuto implementaci jsou již uzavřená v existujícím kódu.
