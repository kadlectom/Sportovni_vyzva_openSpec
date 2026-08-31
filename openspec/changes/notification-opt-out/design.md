## Context

Viz `proposal.md` pro motivaci a rozsah. Aplikace má dva existující osobní DM flows, onboarding nudge a partner-tagged notification, ale tabulka `users` zatím neobsahuje preference pro jejich potlačení. Profilová stránka zobrazuje vlastní i cizí profil, proto musí být změna preference vázaná výhradně na přihlášeného uživatele.

## Goals / Non-Goals

**Goals:**

- Přidat per-user boolean s bezpečným opt-out modelem a defaultem `true`.
- Umožnit uživateli načíst a změnit pouze vlastní preference v nastavení vlastního profilu.
- Kontrolovat preference přímo u každého DM příjemce před zápisem logu i odesláním Slacku.
- Zachovat existující doručení, idempotenci a kanálové notifikace při zapnuté preferenci.

**Non-Goals:**

- Změna kanálových notifikací Monday, bonus start nebo Friday summary.
- Slack „stop“ keyword, Slack Events API nebo jiný botový opt-out flow.
- Admin UI nebo možnost admina přepisovat preference jiných uživatelů.
- Per-type preference; jeden flag platí pouze pro dva určené osobní DM typy.

## Decisions

### Boolean v users s defaultem true

Do `users` se přidá `notificationsEnabled` mapovaný na `notifications_enabled`, `NOT NULL`, s databázovým defaultem `1`. Existující uživatelé tak po migraci zůstanou zapnutí a nový uživatel začne také zapnutý. Alternativa s nullable hodnotou by nejasně míchala „nenastaveno“ s opt-out stavem.

### Self-only settings endpoint

Přidá se endpoint `pages/api/users/me/notifications.ts` s autentizovaným GET/PATCH. GET vrátí aktuální flag přihlášeného uživatele; PATCH přijímá pouze boolean a aktualizuje řádek podle ID ze session, nikdy podle ID dodaného klientem. Pokusy bez session nebo s neboolean hodnotou skončí řízenou chybou. Alternativa `pages/api/users/[id]` by zvyšovala riziko, že klient zamění profilové ID za oprávnění měnit cizí účet.

### Toggle pouze na vlastním profilu

Na `pages/users/[id].tsx` se nastavení zobrazí jen při `isOwnProfile`. Toggle načte hodnotu pro aktuálního uživatele a při změně odešle PATCH na self-only endpoint; cizí profily tuto možnost nevykreslí. UI použije text „Dostávat Slack notifikace“ a jasně zobrazí aktuální stav.

### Kontrola příjemce před log-first delivery

`onboardingNudge.ts` rozšíří kandidátní výběr o `notificationsEnabled` a před idempotency lookup/insert odebere příjemce s hodnotou `false`. `partnerTagged.ts` rozšíří recipient query o stejný sloupec a `loadContext` ponechá pouze zapnuté příjemce. Kontrola se provádí u příjemce, ne u aktéra. Potlačený DM nesmí vytvořit `notification_log`, aby pozdější zapnutí preference umožnilo běžné zpracování v příslušném flow.

### Migrace a testování

Vygeneruje se Drizzle migrace přidávající sloupec s defaultem `1`; ruční backfill není potřeba díky `NOT NULL DEFAULT`. Přidají se unit/API testy pro GET/PATCH self-only authorization, default true, zapnuté doručení, vypnuté čisté přeskočení bez Slack callu a bez log insertu. Stávající kanálové notification flows se testy změny nedotknou.

## Risks / Trade-offs

- [Chyba migrace může zablokovat načítání users] → Ověřit vygenerovanou migraci na dev SQLite a spustit existující DB migration check před nasazením.
- [Preference se čte v kandidátním dotazu a recipient dotazu] → Oba DM flows musí mít recipient-side kontrolu; testy ověří, že preference aktéra není použita.
- [Potlačený onboarding se nezaloguje] → To je záměrný čistý skip; po opětovném zapnutí může uživatel stále splnit aktuální 3–7denní okno.
- [UI může zobrazit zastaralý stav po souběžné změně] → Po úspěšném PATCH aktualizovat lokální stav z odpovědi a při chybě ponechat předchozí hodnotu.

## Migration Plan

1. Přidat sloupec a vygenerovat Drizzle migraci.
2. Nasadit API a recipient-side kontroly spolu s profilem.
3. Ověřit existující uživatele mají `notificationsEnabled = true`, nový toggle načte správný stav a vypnutí nevolá Slack ani nevytváří log.
4. Rollback runtime lze provést revert release; rollback databázového sloupce vyžaduje reverzní migraci pouze pokud se preference definitivně odstraňuje.

## Open Questions

Žádné. Rozsah, příjemce, UI vlastnictví i chování při vypnutí jsou explicitně určeny.
