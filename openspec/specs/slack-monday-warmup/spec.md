# slack-monday-warmup Specification

## Purpose

Poskytuje týmu pravidelnou pondělní rekapitulaci společného pohybu v aktivní sportovní výzvě prostřednictvím motivační zprávy ve Slack kanálu.

## Requirements

### Requirement: Monday warm-up is delivered for active challenges with recent activity

Systém SHALL v pondělním časovém okně připravit a odeslat nejvýše jednu kanálovou Slack zprávu pro každou výzvu se stavem `ACTIVE`, pokud tato výzva obsahuje alespoň jednu aktivitu v posledních sedmi dnech. Výzvy bez aktivity SHALL být přeskočeny.

#### Scenario: Active challenge has recent activity

- **WHEN** pondělní cron zpracuje aktivní výzvu s aktivitou v posledních sedmi dnech
- **THEN** systém odešle souhrnnou zprávu do nakonfigurovaného Slack kanálu

#### Scenario: Active challenge has no recent activity

- **WHEN** pondělní cron zpracuje aktivní výzvu bez aktivity v posledních sedmi dnech
- **THEN** systém Slack zprávu neodešle a výzvu označí jako přeskočenou

#### Scenario: Challenge is not active

- **WHEN** pondělní cron zpracuje výzvu ve stavu `DRAFT`, `CLOSED` nebo `ARCHIVED`
- **THEN** systém ji do pondělní zprávy nezahrne

### Requirement: Warm-up message summarizes team progress

Zpráva SHALL obsahovat název výzvy, počet aktivit v okně, týmový součet bodů prezentovaný jako kilometry, počet zapojených uživatelů a kumulativní týmový součet. Zpráva SHALL používat jednu z pondělních motivačních šablon a nesmí být založena na individuálním pořadí.

#### Scenario: Default summary is rendered

- **WHEN** žádná speciální podmínka šablony není splněna a výzva má recentní aktivitu
- **THEN** zpráva obsahuje obecný nadpis „Pondělní rozcvička“ a týdenní i týmové souhrny

#### Scenario: Milestone is near or crossed

- **WHEN** týdenní statistiky určují blízký nebo právě překonaný klíčový milník
- **THEN** systém vybere milestone šablonu před ostatními šablonami a zpráva obsahuje cílový milník a zbývající vzdálenost

### Requirement: Monday delivery is authenticated and scheduled for Prague morning

Cron endpoint SHALL vyžadovat platný `CRON_SECRET` v autorizační hlavičce. Automatické spuštění SHALL doručovat pouze v hodině 08:00 až 08:59 podle časové zóny `Europe/Prague`; nasazení SHALL mít UTC cron registraci pokrývající 08:30 v zimním i letním čase.

#### Scenario: Authorized request in Prague delivery window

- **WHEN** endpoint obdrží platný cron token a aktuální pražská hodina je 08
- **THEN** systém zpracuje pondělní souhrn a vrátí úspěšnou odpověď s výsledkem zpracování

#### Scenario: Unauthorized request

- **WHEN** endpoint obdrží chybějící nebo neplatný cron token
- **THEN** systém odpoví HTTP 401 a Slack zprávu nezpracuje

#### Scenario: Automatic request outside delivery window

- **WHEN** endpoint obdrží platný cron token, není ručně spuštěn a aktuální pražská hodina není 08
- **THEN** systém vrátí úspěšnou odpověď se stavem přeskočení bez odesílání zprávy

### Requirement: Notification delivery is idempotent per challenge and ISO week

Systém SHALL zabránit opakovanému odeslání stejného pondělního souhrnu pro stejnou výzvu a ISO týden pomocí jedinečného záznamu notifikačního logu. Selhání vložení idempotenčního záznamu SHALL zabránit odeslání zprávy.

#### Scenario: First delivery in an ISO week

- **WHEN** pro dvojici výzva a ISO týden dosud neexistuje log záznam
- **THEN** systém vytvoří záznam a odešle zprávu do Slacku

#### Scenario: Retry in the same ISO week

- **WHEN** cron zpracuje stejnou výzvu a ISO týden podruhé
- **THEN** unikátní konflikt v logu způsobí přeskočení a systém zprávu znovu neodešle
