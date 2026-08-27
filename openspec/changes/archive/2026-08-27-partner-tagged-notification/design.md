## Context

Viz `proposal.md` pro důvod a rozsah. Notifikace už existuje v produkčním kódu: activity API po vytvoření aktivity a po editaci partnerského seznamu předává nově přidané příjemce notifikační vrstvě. Tato vrstva načítá kontext z databáze, sestaví Slack DM a používá existující Slack wrapper a `notification_log`.

## Goals / Non-Goals

**Goals:**

- Zachytit aktuální trigger při vytvoření i editaci aktivity.
- Poslat každému novému partnerovi adresný Slack DM s úplným kontextem aktivity.
- Udržet opakované zpracování idempotentní a chyby notifikací oddělené od hlavního API toku.
- Zachovat čistý formatter oddělený od databázového a síťového I/O.

**Non-Goals:**

- Přidání nové notifikační události nebo změna existující implementace.
- Změna pravidel pro výpočet bodů, partnerského bonusu nebo validaci aktivity.
- Odesílání veřejných kanálových zpráv, leaderboard změn nebo opt-out preference.

## Decisions

### Trigger v activity API

Po vytvoření aktivity se partnerské řádky vloží a poté se zavolá notifikační vrstva pro zadané partnery. Při editaci se před nahrazením partnerského seznamu zachytí existující ID a předají se pouze nově přidaná ID. Tím se opětovné uložení stejného partnera nechová jako nový event. Alternativou by byl trigger přímo na databázový insert, který by hůře rozlišoval původce a editaci.

### Kontext a zpráva

Notifikační vrstva načte aktéra, aktivitu, katalog, výzvu a příjemce paralelně. Formatter vytvoří krátkou zprávu s aktérem, názvem aktivity, hodnotou a jednotkou, připsanými body včetně `partnerBonus` a odkazem na detail výzvy. Alternativou je skládat text přímo v API route, což by míchalo doménovou logiku s doručením a zhoršilo testovatelnost.

### Idempotence per příjemce

Před každým DM se zapisuje `notification_log` s typem `partner_tagged`, `refId` rovným ID aktivity a `userId` rovným příjemci. Unikátní constraint `(type, refId, userId)` řeší opakované i souběžné volání bez kontrolního race condition. Alternativou je pouze deduplikace v paměti, která nepokrývá retry procesu.

### Izolace chyb

Chybějící kontext nebo Slack ID znamená přeskočení příjemce. Jednotlivé DM se zpracovávají odděleně a Slack chyby se logují, ale nepropagují do hlavního activity API. Tím se zachová úspěšnost zápisu aktivity i při výpadku Slacku.

## Risks / Trade-offs

- [Log se zapisuje před Slack odesláním] → Retry po chybě Slacku zprávu znovu neodešle; současné chování preferuje prevenci duplicit před automatickým opakováním.
- [Notifikace závisí na dostupném `slackId` a bot tokenu] → Neplatný nebo chybějící kontext se bezpečně přeskočí a chyba Slacku se pouze zaloguje.
- [Editace partnerského seznamu nejprve smaže a znovu vloží řádky] → Snapshot existujících partnerů před replace zachovává správnou detekci pouze nových příjemců.

## Migration Plan

Žádná migrace není potřeba. Dokumentovaný kód již používá existující `notification_log` a Slack infrastrukturu. Při nasazení stačí zachovat konfiguraci `SLACK_BOT_TOKEN` a běžný databázový constraint.

## Open Questions

Žádné. Toto je retroaktivní dokumentace uzavřeného chování existující implementace.
