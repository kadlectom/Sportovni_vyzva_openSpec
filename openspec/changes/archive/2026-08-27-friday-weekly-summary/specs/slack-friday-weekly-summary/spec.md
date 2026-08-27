## Purpose

Poskytuje týmu páteční kanálovou rekapitulaci společného pohybu za posledních sedm dní pomocí statistických a motivačních zpráv bez běžného individuálního pořadí.

## ADDED Requirements

### Requirement: Active challenges with recent activity receive a Friday summary

Systém SHALL každý pátek zpracovat každou výzvu ve stavu `ACTIVE` a odeslat jí nejvýše jednu kanálovou Slack zprávu, pokud má alespoň jednu aktivitu v rolling okně posledních sedmi dní. Okno SHALL být pro výzvu zkráceno na její začátek, pokud jde o její první týden. Výzvy bez aktivity SHALL být přeskočeny.

#### Scenario: Active challenge has recent activity

- **WHEN** páteční cron zpracuje aktivní výzvu s alespoň jednou aktivitou v posledních sedmi dnech
- **THEN** systém odešle souhrnnou zprávu do nakonfigurovaného Slack kanálu

#### Scenario: Active challenge has no recent activity

- **WHEN** páteční cron zpracuje aktivní výzvu bez aktivity v rolling okně
- **THEN** systém zprávu neodešle a výzvu označí jako přeskočenou

#### Scenario: Multiple active challenges

- **WHEN** je aktivních více výzev s recentní aktivitou
- **THEN** systém zpracuje každou výzvu odděleně a odešle samostatnou zprávu pro každou z nich

### Requirement: Friday summary uses six eligible template variants

Systém SHALL podporovat šest variant pátečního ohlédnutí: A obecné shrnutí, B pestrost a první aktivity, C momentum vůči předchozímu týdnu, D milestone, E dosažené bonusy a F rytmus podle nejaktivnějšího dne. Varianta D SHALL mít absolutní prioritu, pokud je dostupný relevantní milestone; jinak se vybírá z poolu A, B, C, E, F pouze mezi variantami splňujícími své podmínky a výběr se rotuje podle ISO týdne.

#### Scenario: Default template is selected

- **WHEN** výzva má aktivitu, ale žádná speciální varianta B, C, D, E nebo F není způsobilá
- **THEN** systém vybere variantu A

#### Scenario: Milestone template takes priority

- **WHEN** statistiky obsahují `nearestMilestone`, i když jsou způsobilé i jiné varianty
- **THEN** systém vybere variantu D bez ohledu na index týdne

#### Scenario: Eligible templates rotate by ISO week

- **WHEN** milestone není dostupný a více variant v poolu splňuje své podmínky
- **THEN** systém vybere variantu podle pořadí způsobilých A, B, C, E, F a indexu ISO týdne modulo jejich počtu

#### Scenario: Ineligible templates are skipped

- **WHEN** některá varianta nesplňuje svou podmínku
- **THEN** systém ji z rotace vynechá a rotuje pouze mezi zbývajícími způsobilými variantami

### Requirement: Summary content presents inclusive team statistics

Zpráva SHALL obsahovat název výzvy a podle zvolené varianty relevantní týmové statistiky, zejména počet aktivit, týdenní a kumulativní kilometry, počet zapojených uživatelů, top aktivity, pestrost, první výskyty aktivit, rozdíl oproti předchozímu týdnu, dosažené bonusy nebo nejaktivnější den. Zpráva SHALL být standardně bez individuálního žebříčku.

#### Scenario: General summary is rendered

- **WHEN** je vybrána varianta A
- **THEN** zpráva zobrazí páteční ohlédnutí, název výzvy, počet aktivit, týmové kilometry, zapojené uživatele a kumulativní progres

#### Scenario: Momentum handles a lower previous week comparison

- **WHEN** je vybrána varianta C a aktuální týden má méně kilometrů než předchozí
- **THEN** zpráva použije neutrální formulaci rozdílu bez hanlivého hodnocení

#### Scenario: Milestone is just crossed or upcoming

- **WHEN** je vybrána varianta D
- **THEN** zpráva oslaví překonaný milestone nebo zobrazí zbývající vzdálenost k nadcházejícímu milestone

#### Scenario: Bonus summary scales with earned bonuses

- **WHEN** je vybrána varianta E a bylo dosaženo jednoho, až tří nebo více než tří bonusů
- **THEN** zpráva použije odpovídající detailní nebo agregovaný formát bonusů

### Requirement: Friday summary delivery is authenticated, scheduled, and idempotent

Cron endpoint SHALL vyžadovat platný `CRON_SECRET`. Automatické spuštění SHALL doručovat pouze v pražské hodině 14; deployment SHALL obsahovat UTC běhy `12:00` a `13:00`, aby bylo pokryto CET i CEST. Systém SHALL zabránit opakovanému odeslání stejné výzvy ve stejném ISO týdnu přes jedinečný záznam notifikačního logu. Ruční trigger SHALL umožnit obejít časový gate při zachování autentizace.

#### Scenario: Authorized request in Prague hour fourteen

- **WHEN** endpoint obdrží platný cron token a aktuální pražská hodina je 14
- **THEN** systém zpracuje páteční souhrny a vrátí výsledek zpracování

#### Scenario: Automatic request outside the delivery hour

- **WHEN** endpoint obdrží platný token, není ručně spuštěn a pražská hodina není 14
- **THEN** systém vrátí řízenou odpověď se stavem přeskočení bez odesílání

#### Scenario: Same challenge and ISO week are retried

- **WHEN** cron zpracuje stejnou aktivní výzvu ve stejném ISO týdnu podruhé
- **THEN** unikátní log záznam zabrání opakovanému odeslání

#### Scenario: Unauthorized request

- **WHEN** endpoint obdrží chybějící nebo neplatný cron token
- **THEN** systém odpoví HTTP 401 a souhrn nezpracuje
