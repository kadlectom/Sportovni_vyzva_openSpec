## Context

Viz `proposal.md` pro motivaci a rozdíly oproti původnímu návrhu. Implementace už existuje v aplikaci jako denní cron, který vybírá dnešní bonusová pravidla z aktivních výzev, formátuje jejich podmínky a posílá je do společného Slack kanálu.

## Goals / Non-Goals

**Goals:**

- Zachytit skutečná kritéria výběru a časové chování bonusového oznámení.
- Zachytit samostatné zprávy pro jednotlivá pravidla, formátování podmínek a odměny.
- Zachytit idempotentní a fault-tolerantní doručení.
- Zachytit současné chování edge cases bez jeho domyšlení nebo rozšíření.

**Non-Goals:**

- Změna runtime implementace nebo doplnění dosud neexistující podpory.
- Sloučení více bonusů do jedné zprávy.
- Zpětné dohledávání bonusů s minulým datem.
- Oznámení celovýzvových bonusů s `windowStart = null` při přechodu výzvy do `ACTIVE`.

## Decisions

### Přesná shoda data a stavu výzvy

Výběr odpovídá přesně dnešnímu UTC datu v `windowStart` a stavu `ACTIVE`. Pravidla bez data začátku ani pravidla s minulým datem se proto denním cronem nezpracují. Alternativou by byl intervalový nebo backfill dotaz, který by zpětně oznamoval zmeškané bonusy, ale ten aktuální kód nepoužívá.

### Jedna Slack zpráva na pravidlo

Každé pending pravidlo dostane vlastní kanálovou zprávu. Více pravidel ve stejný den se neslučuje, přestože původní návrh tuto možnost doporučuje. Toto je dokumentované skutečné chování, nikoli nový designový požadavek.

### Sdílený formatter podmínek

Zpráva se skládá pomocí čistého `formatBonusCondition`, který dostane typ podmínky, threshold, katalogové názvy, data a dny v týdnu. Názvy katalogu se předem načítají z ID uložených v JSON; poškozené JSON hodnoty jsou bezpečně ignorovány nebo vedou k chybějícím detailům, nikoli k pádu celého cron běhu.

### Log-first idempotence per pravidlo

Před odesláním se zapisuje záznam `notification_log` typu `bonus_start`, s `refId` rovným ID pravidla a `userId = null`. Existující záznam i unikátní konflikt znamenají přeskočení. Tím je ochrana prakticky per pravidlo po dobu jeho životnosti, nikoli per datum, protože výběr již odeslaných záznamů nefiltruje `sentAt`.

### Dvojí UTC plán a lokální gate

`vercel.json` spouští route v `07:00` a `08:00` UTC. Handler propustí jen běh v pražské hodině 09, takže jeden slot odpovídá lokálnímu rannímu oknu podle CET/CEST. Ruční trigger může gate obejít a vyžaduje stále platný `CRON_SECRET`.

## Risks / Trade-offs

- [Záznam se zapisuje před Slack odesláním] → Selhání Slacku může zabránit opakovanému automatickému doručení, ale předchází duplicitám.
- [Více bonusů znamená více zpráv] → Kanál může dostat několik samostatných oznámení ve stejný den; odpovídá to současnému kódu.
- [Pravidla bez `windowStart` a minulá pravidla nejsou backfillována] → Tato varianta zůstává bez oznámení, dokud nebude implementován samostatný trigger nebo backfill.

## Migration Plan

Žádná migrace není potřeba. Dokumentovaný cron a `notification_log` již existují. Pro provozní ověření se zachováním autentizace lze použít ruční trigger; rollback dokumentace nevyžaduje změnu runtime kódu.

## Open Questions

Žádné. Edge cases byly ověřeny proti skutečnému kódu a zapsány jako jeho aktuální chování.
