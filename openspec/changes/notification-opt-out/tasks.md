## 1. Datový model a migrace

- [x] 1.1 Přidat `users.notificationsEnabled` mapovaný na `notifications_enabled` jako NOT NULL boolean s defaultem `true` a ověřit typovou kontrolou schématu.
- [x] 1.2 Vygenerovat a zkontrolovat Drizzle migraci pro nový sloupec; ověřit aplikací migrace na vývojové SQLite databázi.

## 2. Self-service profilové nastavení

- [x] 2.1 Vytvořit autentizovaný endpoint `pages/api/users/me/notifications.ts` pro GET a PATCH preference; ověřit, že PATCH přijímá pouze boolean a nikdy nepoužívá klientem dodané ID.
- [x] 2.2 Přidat na vlastní profil checkbox/toggle „Dostávat Slack notifikace“; ověřit načtení aktuální hodnoty, uložení změny a skrytí ovládání na cizím profilu.
- [x] 2.3 Ověřit self-only autorizaci a výchozí stav `true` testy API/UI.

## 3. Recipient-side potlačení DM

- [x] 3.1 Upravit onboarding nudge tak, aby kontroloval `notificationsEnabled` u příjemce před log insert a Slack odesláním; ověřit zapnuté doručení i vypnuté čisté přeskočení bez Slack callu a bez `notification_log`.
- [x] 3.2 Upravit partner-tagged notification tak, aby kontrolovala `notificationsEnabled` u každého příjemce, nikoli u aktéra; ověřit zapnuté doručení i vypnuté čisté přeskočení bez logu.
- [x] 3.3 Ověřit, že kanálové notifikace a ostatní notification flows nejsou opt-out změnou ovlivněné.

## 4. Testování a dokončení

- [x] 4.1 Přidat nebo rozšířit unit/API testy pro preference, oba DM flows, idempotenci a chyby; ověřit `npm test`.
- [x] 4.2 Spustit typecheck/build a ověřit `npm run build` včetně nové API route a profilového UI.
- [x] 4.3 Ověřit migration/schema stav a zdokumentovat změnu podle aktualizovaných specs; ověřit `openspec validate` pro change.
