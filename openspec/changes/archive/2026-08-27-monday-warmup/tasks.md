## 1. Statistika a obsah zprávy

- [x] 1.1 Znovu použít existující weekly-stats základ pro rolling okno posledních sedmi dnů, týmové součty, aktivitu a milestone stav; ověřeno průchodem `npm run build`.
- [x] 1.2 Vytvořit samostatný výběr pondělních šablon s prioritou milestone varianty a rotací běžných variant; ověřeno testy `__tests__/lib/notifications/mondayTemplate.test.ts`.
- [x] 1.3 Vytvořit renderery pondělní zprávy s výchozím souhrnem, názvem výzvy a týmovými statistikami; ověřeno testy renderování šablon.

## 2. Doručení a idempotence

- [x] 2.1 Implementovat zpracování aktivních výzev a přeskočení výzev bez aktivity v posledních sedmi dnech; ověřeno typovou kontrolou a buildem Next.js.
- [x] 2.2 Připojit doručení do Slack kanálu přes existující helper a strukturovaný výsledek `sent/skipped/failed`; ověřeno kompilací routy `/api/cron/monday-summary` v `npm run build`.
- [x] 2.3 Zajistit log-first idempotenci přes `notification_log` pro kombinaci challenge + ISO week; ověřeno existencí unikátního constraintu ve schématu a migraci a úspěšným buildem.

## 3. Cron a provozní konfigurace

- [x] 3.1 Přidat chráněný endpoint `/api/cron/monday-summary` s `CRON_SECRET`, pražským časovým gate a ručním triggerem; ověřeno zahrnutím endpointu v produkčním výpisu `npm run build`.
- [x] 3.2 Registrovat pondělní cron běhy pro CET i CEST tak, aby doručovací okno odpovídalo 08:30 Europe/Prague; ověřeno konfigurací v `vercel.json`.
- [x] 3.3 Přidat unit testy pro fallback a milestone výběr i renderování a spustit regresní ověření; ověřeno výsledkem `npm test` 175/175 testů.
