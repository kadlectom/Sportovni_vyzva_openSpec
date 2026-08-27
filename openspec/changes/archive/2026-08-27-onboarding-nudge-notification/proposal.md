## Why

Uživatel, který se přihlásil do aktivní výzvy, může bez připomenutí zůstat bez první aktivity. Současná aplikace mu včas posílá soukromý Slack nudge, ale toto chování dosud není zachyceno v OpenSpec; dokumentace proto vychází ze skutečné implementace, nikoli pouze z původního návrhu.

## What Changes

- Dokumentuje denní výběr uživatelů přihlášených do `ACTIVE` výzvy před 3 až 7 dny.
- Dokumentuje podmínku, že uživatel v dané výzvě dosud nemá žádnou aktivitu.
- Dokumentuje soukromou Slack DM zprávu s názvem výzvy a odkazem pro zapsání první aktivity.
- Dokumentuje idempotenci per uživatel + challenge prostřednictvím `notification_log` po celou dobu života výzvy.
- Dokumentuje řízené přeskočení již oslovených uživatelů, závodního insertu, chybějící konfigurace a selhání Slacku.
- Dokumentuje chráněný cron endpoint a automatické doručení v pražské hodině 10.

### Odchylka od NAVRH_Slack_notifikace.md

Položka #12 popisuje trigger 24 hodin po `enrolled_at`; skutečný kód používá okno 3–7 dní, aby zachytil i zmeškané cron běhy. Skutečný kód také používá jednu idempotentní notifikaci na uživatele a výzvu po celou dobu jejího života a automaticky zpracovává pouze `ACTIVE` výzvy.

## Capabilities

### New Capabilities

- `slack-onboarding-nudge-notification`: Soukromé Slack připomenutí uživateli, který se přihlásil do aktivní výzvy, ale dosud nezapsal aktivitu.

### Modified Capabilities

- Žádné.

## Impact

Dotčené existující části jsou `lib/notifications/onboardingNudge.ts`, `lib/notifications/format.ts` a `pages/api/cron/onboarding-nudge.ts`. Implementace používá existující `sendSlackDM`, `notificationLog`, `CRON_SECRET`, `NEXTAUTH_URL` a `vercel.json`; nepřidává runtime závislosti ani nemění API aktivit. Jde o retroaktivní dokumentaci, nikoli o nový implementační úkol.
