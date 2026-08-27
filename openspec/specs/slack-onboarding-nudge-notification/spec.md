# slack-onboarding-nudge-notification Specification

## Purpose

Připomíná uživatelům přihlášeným do aktivní sportovní výzvy první aktivitu prostřednictvím soukromé Slack zprávy, pokud několik dní po přihlášení stále nic nezapsali.

## Requirements

### Requirement: Eligible inactive enrollees receive an onboarding DM

Systém SHALL každý den vybrat uživatele přihlášené do výzvy ve stavu `ACTIVE`, jejichž přihlášení je staré nejméně 3 a nejvýše 7 kalendářních dnů, a kteří v dané výzvě nemají žádnou aktivitu. Každému způsobilému uživateli SHALL odeslat soukromou Slack zprávu.

#### Scenario: Enrollee is inactive three to seven days after joining

- **WHEN** uživatel je v aktivní výzvě 3 až 7 dní a v této výzvě nemá žádnou aktivitu
- **THEN** systém mu odešle onboardingový Slack DM

#### Scenario: Enrollee has already logged an activity

- **WHEN** uživatel v aktivní výzvě již má alespoň jednu aktivitu
- **THEN** systém ho přeskočí a onboardingový DM neodešle

#### Scenario: Challenge is not active

- **WHEN** přihlášení patří výzvě ve stavu `DRAFT`, `CLOSED` nebo `ARCHIVED`
- **THEN** uživatel není kandidátem pro onboardingový DM

#### Scenario: Enrolment is outside the age window

- **WHEN** přihlášení je mladší než 3 dny nebo starší než 7 dní
- **THEN** systém uživatele v tomto běhu nevybere

### Requirement: Onboarding DM contains a first-activity call to action

Zpráva SHALL uvádět název výzvy, vysvětlit, že uživatel zatím nic nezapsal, povzbudit ho k první aktivitě a obsahovat odkaz na detail výzvy s výzvou k zapsání první aktivity. Odkaz SHALL použít slug výzvy, pokud existuje, jinak její ID.

#### Scenario: Nudge message is rendered

- **WHEN** systém zpracuje způsobilého uživatele a zná název i identifikátor výzvy
- **THEN** DM obsahuje název výzvy a akční odkaz pro zapsání první aktivity

### Requirement: Onboarding notification is idempotent and resilient

Systém SHALL odeslat nejvýše jeden onboardingový DM pro kombinaci uživatele a výzvy po celou dobu života výzvy. Selhání vložení idempotenčního záznamu SHALL zprávu přeskočit a chyba Slacku nebo jiná neočekávaná chyba SHALL nezpůsobit neřízené ukončení cron zpracování.

#### Scenario: User was already nudged

- **WHEN** pro kombinaci uživatele a výzvy již existuje záznam typu `onboarding_nudge`
- **THEN** systém kandidáta přeskočí a DM znovu neodešle

#### Scenario: Concurrent cron runs process the same candidate

- **WHEN** dva běhy současně zpracují stejného uživatele a výzvu
- **THEN** unikátní záznam v notifikačním logu dovolí odeslání pouze jednomu běhu

#### Scenario: Slack delivery fails

- **WHEN** Slack API vrátí chybu nebo není dostupný token
- **THEN** systém selhání zaznamená a zpracování cron požadavku zůstane řízené

### Requirement: Onboarding cron is authenticated and scheduled for Prague morning

Cron endpoint SHALL vyžadovat platný `CRON_SECRET`. Automatické spuštění SHALL zpracovávat notifikace pouze v pražské hodině 10; deployment SHALL obsahovat UTC běhy `08:00` a `09:00`, aby bylo pokryto CET i CEST. Ruční trigger SHALL umožnit obejít časový gate při zachování autentizace.

#### Scenario: Authorized request in Prague hour ten

- **WHEN** endpoint obdrží platný cron token a aktuální pražská hodina je 10
- **THEN** systém zpracuje onboardingové kandidáty a vrátí výsledek

#### Scenario: Automatic request outside the delivery hour

- **WHEN** endpoint obdrží platný token, není ručně spuštěn a pražská hodina není 10
- **THEN** systém vrátí řízenou odpověď se stavem přeskočení bez odesílání DM

#### Scenario: Unauthorized request

- **WHEN** endpoint obdrží chybějící nebo neplatný cron token
- **THEN** systém odpoví HTTP 401 a onboardingová notifikace se nezpracuje
