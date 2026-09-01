## Why

Uživatelé potřebují sami řídit, zda chtějí dostávat osobní Slack DM notifikace. Současné onboardingové a partner-tagged zprávy nemají per-user opt-out, proto tato změna přidá bezpečný výchozí stav `true`, vlastní nastavení profilu a kontrolu preference přímo u příjemce před odesláním DM.

## What Changes

- Přidá `users.notificationsEnabled` jako povinný boolean s výchozí hodnotou `true` a vytvoří Drizzle migraci.
- Přidá do vlastního profilu checkbox/toggle „Dostávat Slack notifikace“.
- Přidá self-only API operaci pro načtení a změnu preference; uživatel nesmí měnit nastavení jiného uživatele.
- Rozšíří `onboarding-nudge-notification` a `partner-tagged-notification`: před odesláním se kontroluje preference příjemce, nikoli aktéra.
- Při `notificationsEnabled = false` se DM neodešle ani se nezapíše `notification_log`; jde o čisté přeskočení.
- Zachová dosavadní chování při zapnuté preferenci a ponechá kanálové notifikace mimo opt-out.
- Nezavádí Slack „stop“ keyword ani Slack Events API flow.

## Capabilities

### New Capabilities

- Žádné.

### Modified Capabilities

- `slack-onboarding-nudge-notification`: Osobní onboardingový DM respektuje preference příjemce.
- `slack-partner-tagged-notification`: Osobní partner-tagged DM respektuje preference příjemce.

## Impact

Dotčené části budou `db/schema.ts`, nová Drizzle migrace, `lib/notifications/onboardingNudge.ts`, `lib/notifications/partnerTagged.ts`, nová self-service API route pro profilovou preferenci a `pages/users/[id].tsx`. Dotčené existující capability specs jsou `openspec/specs/slack-onboarding-nudge-notification/spec.md` a `openspec/specs/slack-partner-tagged-notification/spec.md`; kanálové specs se nemění. Změna vyžaduje databázovou migraci, ale nepřidává runtime závislost.
