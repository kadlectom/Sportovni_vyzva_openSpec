## Context

Viz `proposal.md` pro motivaci a odchylku od původního návrhu. Implementace už existuje jako denní cron: vyhledá přihlášení v aktivních výzvách ve stáří 3–7 dní, vyřadí dvojice s aktivitou nebo předchozím nudgem, zapíše idempotenční log a odešle individuální Slack DM.

## Goals / Non-Goals

**Goals:**

- Zachytit skutečné kandidátní filtrování a časové okno onboard nudgu.
- Zachytit obsah DM a URL fallback na slug nebo ID výzvy.
- Zachytit idempotenci per uživatel a výzva a izolaci chyb Slacku od cron běhu.
- Zachytit pražský časový gate a UTC plánování.

**Non-Goals:**

- Změna runtime implementace nebo přechod na přesný trigger 24 hodin po enrollu.
- Přidání opt-out preference, doporučení katalogu nebo dalších onboardingových zpráv.
- Odesílání do kanálu místo soukromých DM.

## Decisions

### Denní okno 3–7 dní

Kandidáti se vybírají podle `enrolledAt >= now - 7 dní` a `enrolledAt <= now - 3 dny`, obojí včetně hranic. Toto nahrazuje návrhový trigger 24 hodin po enrollu a současně toleruje zmeškané denní běhy. Alternativou by byl jednorázový event nebo přesný 24hodinový job, ale ten neodpovídá skutečnému kódu.

### Aktivita se vyhodnocuje pro dvojici uživatel–výzva

Počáteční kandidátní dotaz omezuje stav výzvy na `ACTIVE`; následný dotaz sestaví množinu dvojic, které už mají nejméně jednu aktivitu. Kandidáti s odpovídající dvojicí se vyřadí. Tím se nehodnotí aktivita uživatele v jiné výzvě jako důvod pro přeskočení.

### Log-first idempotence po dobu života výzvy

Identifikátor reference má tvar `<userId>:<challengeId>` a typ `onboarding_nudge`; předchozí záznam se vyhledává bez omezení na datum. Unikátní constraint proto chrání před opakováním i při zmeškaných bězích po celou dobu života výzvy, nikoli pouze v jednom týdnu.

### Samostatný DM formatter

Čistý formatter vloží název výzvy a odkaz `${NEXTAUTH_URL}/challenges/<slug nebo id>` do krátké zprávy s CTA pro první aktivitu. Databázové dotazy, prostředí a Slack I/O zůstávají mimo formatter, což umožňuje jeho izolované testování.

### Lokální časový gate

Route vyžaduje `CRON_SECRET`, automaticky propouští jen pražskou hodinu 10 a podporuje ruční trigger přes `X-Manual-Trigger: 1`. `vercel.json` obsahuje 08:00 a 09:00 UTC, takže jeden slot odpovídá 10:00 lokálně v CET/CEST.

## Risks / Trade-offs

- [DM je připraven před odesláním logu a log se zapisuje před Slackem] → Souběžný běh nemůže poslat duplicitu, ale selhání Slacku může zanechat kandidáta bez automatického retry.
- [Rozsah 3–7 dní může oslovit uživatele později než původně zamýšlených 24 hodin] → Okno je přesně popsáno jako současný behavior contract a zachytí zmeškané cron běhy.
- [Notifikace závisí na `SLACK_BOT_TOKEN` a uživatelském Slack ID] → Chyby se logují a neukončují nekontrolovaně cron zpracování.

## Migration Plan

Žádná migrace není potřeba. Dokumentovaný cron a databázová tabulka `notification_log` již existují. Pro provozní ověření lze s platným `CRON_SECRET` použít ruční trigger; rollback dokumentace nevyžaduje změnu runtime kódu.

## Open Questions

Žádné. Dokument zachycuje uzavřené chování existující implementace.
