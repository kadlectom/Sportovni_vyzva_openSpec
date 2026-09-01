## 1. Datový model a migrace

- [ ] 1.1 Přidat `users.notificationsEnabled` jako `NOT NULL BOOLEAN` s výchozí hodnotou `true` a zajistit, aby nový sloupec odpovídal databázovému schématu aplikace.
- [ ] 1.2 Vygenerovat a zkontrolovat Drizzle migraci pro přidání sloupce; ověřit, že existující uživatelé zůstanou ve výchozím zapnutém stavu.

## 2. Self-service profilové nastavení

- [ ] 2.1 Přidat vlastní profilový endpoint pro čtení a úpravu `notificationsEnabled` tak, aby uživatel mohl měnit pouze svůj vlastní záznam.
- [ ] 2.2 Přidat do vlastního profilu checkbox/toggle „Dostávat Slack notifikace“ a zajistit, že se zobrazuje pouze pro přihlášeného uživatele.
- [ ] 2.3 Ověřit, že cizí uživatel neodpovídá za nastavení jiné osoby a že výchozí hodnota je `true`.

## 3. Recipient-side potlačení osobních DM

- [ ] 3.1 Upravit `lib/notifications/onboardingNudge.ts` tak, aby před odesláním Slack DM načítal `notificationsEnabled` příjemce a při `false` přeskočil bez Slack volání i bez zápisu do `notification_log`.
- [ ] 3.2 Upravit `lib/notifications/partnerTagged.ts` stejným způsobem pro každý cílový partner a zajistit, že kontrola se provádí u příjemce, ne u aktéra.
- [ ] 3.3 Potvrdit, že kanálové notifikace nejsou součástí této změny a zůstávají beze změny.

## 4. Testování a ověření

- [ ] 4.1 Přidat/rozšířit testy pro výchozí stav `true`, self-only update, zapnuté doručení a vypnuté přeskočení bez Slack volání a bez `notification_log` záznamu.
- [ ] 4.2 Ověřit migraci a profilové API v rámci relevantních testů a typechecku pro danou změnu.
- [ ] 4.3 Zkontrolovat, že requirementy v delta specs odpovídají novému chování a že změna je přesně o „osobních DM opt-out“, nikoli o kanálových notifikacích.

## 5. Implementační připomínky

- Jedná se o změnu ve stávajícím chování: při zapnuté preferenci se zachová současné chování, při vypnuté preferenci se DM přeskočí.
- Rozsah je omezen na `onboarding-nudge-notification` a `partner-tagged-notification`.
- Slack „stop“ příkaz a jiné botové opt-out mechanismy nejsou součástí této změny.
