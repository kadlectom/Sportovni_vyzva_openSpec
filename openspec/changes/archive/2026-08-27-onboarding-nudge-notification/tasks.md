## 1. Kandidáti onboard nudgu

- [x] 1.1 Zdokumentovat výběr enrollments v `ACTIVE` výzvách s věkem 3–7 dní včetně hranic; ověřeno filtry `enrolledAt >= now - 7 dní` a `enrolledAt <= now - 3 dny` v `lib/notifications/onboardingNudge.ts`.
- [x] 1.2 Zdokumentovat vyřazení uživatelů s aktivitou ve stejné výzvě; ověřeno množinou dvojic `userId|challengeId` sestavenou z tabulky aktivit.
- [x] 1.3 Zdokumentovat vyřazení neaktivních, neaktivních-stavových a věkově nevhodných kandidátů; ověřeno kandidátním dotazem a následnými filtry v `onboardingNudge.ts`.

## 2. DM obsah a idempotence

- [x] 2.1 Zdokumentovat soukromý Slack DM s názvem výzvy a CTA pro první aktivitu; ověřeno `formatOnboardingNudgeMessage` v `lib/notifications/format.ts`.
- [x] 2.2 Zdokumentovat URL na detail výzvy se slug fallbackem na ID; ověřeno sestavením URL z `NEXTAUTH_URL` a `challengeSlug ?? challengeId`.
- [x] 2.3 Zdokumentovat lifetime idempotenci per uživatel + challenge a log-first insert; ověřeno typem `onboarding_nudge`, refId a unikátním constraintem `notification_log`.
- [x] 2.4 Zdokumentovat řízené zpracování Slack a databázových chyb; ověřeno obsluhou výjimek a výsledky `sent/skipped/failed` v notifikační vrstvě.

## 3. Cron a retroaktivní dokumentace

- [x] 3.1 Zdokumentovat autentizovaný endpoint, pražskou hodinu 10 a ruční trigger; ověřeno `pages/api/cron/onboarding-nudge.ts`.
- [x] 3.2 Zdokumentovat UTC rozvrh `08:00`/`09:00` pro CET/CEST; ověřeno `vercel.json`.
- [x] 3.3 Vytvořit proposal, design, delta spec a tento checklist bez změny runtime kódu; ověřeno kompletním OpenSpec statusem po vytvoření artifacts.
