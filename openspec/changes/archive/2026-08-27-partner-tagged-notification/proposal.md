## Why

Uživatel označený jako partner u aktivity potřebuje vědět, kdo ho označil, u jaké aktivity a kolik bodů mu bylo připsáno. Tato capability už v aplikaci existuje, ale její skutečné chování dosud není zachyceno v OpenSpec; dokumentace proto vychází z aktuální implementace, nikoli pouze z původního návrhu notifikací.

## What Changes

- Dokumentuje DM zprávu partnerovi po přidání do `activityPartners` při vytvoření aktivity.
- Dokumentuje DM zprávu pouze nově přidaným partnerům při editaci aktivity; opětovné označení existujícího partnera notifikaci znovu nespustí.
- Dokumentuje obsah zprávy: jméno aktéra, název aktivity, zadanou hodnotu, jednotku, celkem připsané body včetně partnerského bonusu a odkaz na detail výzvy.
- Dokumentuje idempotenci přes `notification_log` pro kombinaci aktivity a příjemce.
- Dokumentuje vynechání příjemců bez platného Slack ID a odolnost vůči chybám načtení kontextu nebo Slacku.

### Odchylky od NAVRH_Slack_notifikace.md

- Původní návrh uvádí trigger po insertu do `activityPartners` bez detailu editace; skutečný kód posílá notifikaci také při editaci, ale pouze nově přidaným partnerům.
- Původní návrh uvádí „Cap: žádný“; skutečný kód má idempotentní ochranu per aktivita a příjemce přes `notification_log`.
- Skutečný formatter zobrazuje připsané body včetně `partnerBonus` a URL na detail výzvy. Dokumentace zachycuje tuto implementovanou podobu.

## Capabilities

### New Capabilities

- `slack-partner-tagged-notification`: Soukromá Slack DM notifikace uživateli po novém označení jako partnera u aktivity.

### Modified Capabilities

- Žádné.

## Impact

Dotčené existující části jsou `lib/notifications/partnerTagged.ts`, `lib/notifications/format.ts`, `pages/api/activities/index.ts` a `pages/api/activities/[id].ts`. Implementace používá existující `sendSlackDM`, databázový `notification_log` a constraint `(type, refId, userId)`; nepřidává runtime závislosti ani nemění API kontrakt aktivit. Jde o retroaktivní dokumentaci, nikoli o nový implementační úkol.
