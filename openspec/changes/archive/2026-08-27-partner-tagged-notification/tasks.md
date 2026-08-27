## 1. Trigger a příjemci

- [x] 1.1 Zdokumentovat trigger po vytvoření aktivity s partnery v `pages/api/activities/index.ts`; ověřeno kontrolou skutečného volání `notifyPartnerTagged` po insertu `activityPartners`.
- [x] 1.2 Zdokumentovat trigger při editaci aktivity v `pages/api/activities/[id].ts`, včetně filtrování pouze nově přidaných partnerů; ověřeno kontrolou snapshotu existujících partnerů a výpočtu `newlyAddedPartners`.
- [x] 1.3 Zachytit vynechání příjemců bez Slack ID a chybějícího kontextu; ověřeno implementací `loadContext` v `lib/notifications/partnerTagged.ts`.

## 2. Obsah a doručení

- [x] 2.1 Zdokumentovat načtení aktéra, aktivity, katalogu, výzvy a příjemců a sestavení adresného DM; ověřeno skutečným kódem `partnerTagged.ts` a `format.ts`.
- [x] 2.2 Zdokumentovat zahrnutí hodnoty, jednotky, připsaných bodů včetně partnerského bonusu a odkazu na detail výzvy; ověřeno testy `__tests__/lib/notifications/format.test.ts`.
- [x] 2.3 Zdokumentovat izolaci Slack chyb od hlavního API zpracování aktivity; ověřeno `Promise.allSettled`, obsluhou výsledku Slacku a průchodem `npm test`.

## 3. Idempotence a validace

- [x] 3.1 Zdokumentovat log-first idempotenci per aktivita a příjemce přes `notification_log`; ověřeno typem `partner_tagged`, `refId` aktivita a unikátním constraintem `(type, refId, userId)` ve schématu.
- [x] 3.2 Vytvořit delta spec `slack-partner-tagged-notification` jako behavior contract odpovídající skutečné implementaci; ověřeno strict validací OpenSpec.
- [x] 3.3 Vytvořit proposal, design a tento retroaktivní checklist bez změny produkčního kódu; ověřeno kompletním OpenSpec statusem a existencí všech artifactů.
