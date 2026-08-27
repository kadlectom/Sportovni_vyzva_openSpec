## Context

Viz `proposal.md` pro motivaci a odchylky od návrhové „Páteční předehry“. Implementace už existuje jako páteční kanálový souhrn: pro aktivní výzvy agreguje rolling sedmidenní statistiky, vybere šablonu a odešle zprávu s log-first idempotencí.

## Goals / Non-Goals

**Goals:**

- Zachytit skutečných šest šablon A–F a jejich podmínky.
- Zachytit přesnou prioritu milestone a rotaci filtrovaného poolu.
- Zachytit týmový obsah zpráv, neutrální framing a různé formáty bonusového souhrnu.
- Zachytit páteční časový gate, multi-challenge zpracování a idempotenci.

**Non-Goals:**

- Implementace návrhových šablon E1–E4 jako nové vrstvy.
- Fázování podle týdne nebo konce výzvy, speciální „poslední víkend“ varianta a podmínka minimálně dvou dnů do konce.
- Individuální leaderboard, DM zprávy nebo změna weekly-statistics agregací.

## Decisions

### Samostatná páteční template vrstva

Páteční renderer používá typ `A` až `F`: A obecné shrnutí, B pestrost a první výskyty, C momentum, D milestone, E bonusy a F rytmus týdne. Tím se liší od původního návrhu E1–E4 a odpovídá skutečným nadpisům i datům, která weekly stats poskytují.

### Prioritní gate a rotace

Výběr nejprve testuje D; pokud je `nearestMilestone` nenulový, D vyhraje bez ohledu na `weekIndex`. Jinak se vytvoří způsobilý podpool z A, B, C, E, F a vybere se položka na indexu `weekIndex modulo počet způsobilých položek`. Podmínky jsou: A `activityCount > 0`, B pestrost nejméně 4, C aktivita v předchozím týdnu, E nejméně jeden získaný bonus a F dostupný nejaktivnější den. Alternativou by byl pevný kalendář fází, ale ten v kódu není.

### Rolling statistiky a inkluzivní obsah

Každá aktivní výzva používá okno posledních sedmi dnů, zkrácené na `startDate` v prvním týdnu. Zprávy používají týmové metriky a varianta C při poklesu vykresluje neutrální „klidnější“ formulaci. Varianta E zobrazuje jeden bonus inline, dva až tři jako seznam a čtyři nebo více jako agregovaný počet a součet.

### Log-first idempotence

Před Slack odesláním se zapisuje `notification_log` typu `weekly_summary`, s `refId` `<challengeId>:<isoWeek>` a `userId = null`. Konflikt při opakování nebo souběhu znamená přeskočení. Alternativou je kontrola existence před insertem, která by měla race condition.

### Lokální časový gate

Route vyžaduje `CRON_SECRET`, automaticky propouští pouze pražskou hodinu 14 a ruční trigger může gate obejít. `vercel.json` plánuje `12:00` a `13:00` UTC, aby jeden běh doručil v 14:00 lokálně podle CET/CEST.

## Risks / Trade-offs

- [Log-first zápis může při následném selhání Slacku zabránit retry] → Převládá prevence duplicit a selhání se vrací ve výsledku/loguje.
- [Rotace závisí na aktuálně způsobilých variantách] → Přidání nebo odebrání statistických dat může změnit variantu v konkrétním týdnu; chování je deterministické podle `weekIndex` a způsobilého poolu.
- [Více aktivních výzev generuje více zpráv] → Každá výzva je zpracována odděleně, což zachovává správný kontext souhrnu.

## Migration Plan

Žádná migrace není potřeba. Dokumentovaný cron, Slack helper, weekly stats a `notification_log` již existují. Provozní ověření lze provést ručním triggerem s platným `CRON_SECRET`; rollback dokumentace nevyžaduje zásah do runtime kódu.

## Open Questions

Žádné. Výběrová logika a obsah šablon byly ověřeny proti aktuálnímu kódu a testům.
