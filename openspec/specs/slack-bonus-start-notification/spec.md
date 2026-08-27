# slack-bonus-start-notification Specification

## Purpose

Oznamuje týmu v Slack kanálu začátek bonusových pravidel v aktivních sportovních výzvách včetně podmínky, odměny a odkazu na příslušnou výzvu.

## Requirements

### Requirement: Active bonuses starting today are announced in the channel

Systém SHALL v denním časovém okně vybrat bonusová pravidla s `windowStart` přesně odpovídajícím dnešnímu UTC datu a pouze z výzev ve stavu `ACTIVE`. Pro každé vybrané pravidlo SHALL odeslat samostatnou zprávu do nakonfigurovaného Slack kanálu.

#### Scenario: Bonus starts today in an active challenge

- **WHEN** denní cron zpracuje pravidlo s `windowStart` rovným dnešnímu UTC datu v aktivní výzvě
- **THEN** systém odešle jednu kanálovou zprávu oznamující začátek bonusu

#### Scenario: Bonus belongs to an inactive challenge

- **WHEN** pravidlo s dnešním `windowStart` patří výzvě ve stavu `DRAFT`, `CLOSED` nebo `ARCHIVED`
- **THEN** systém pravidlo nevybere a zprávu neodešle

#### Scenario: Bonus has no window start

- **WHEN** bonusové pravidlo má `windowStart = null`
- **THEN** denní oznámení ho nevybere a neodešle pro něj zprávu

#### Scenario: Multiple bonuses start on the same day

- **WHEN** více aktivních bonusových pravidel má stejné dnešní `windowStart`
- **THEN** systém odešle samostatnou zprávu pro každé pravidlo a neslučuje je do jedné zprávy

#### Scenario: Bonus was added with a date in the past

- **WHEN** admin přidá aktivní bonusové pravidlo s `windowStart` starším než dnešní UTC datum
- **THEN** systém ho zpětně neoznámí

### Requirement: Bonus announcement contains actionable rule details

Zpráva SHALL obsahovat název bonusového pravidla, jeho podmínku, výši odměny v kilometrech a odkaz s názvem příslušné výzvy. Pokud podmínka filtruje katalogové aktivity, zpráva SHALL uvést jejich názvy; pokud obsahuje datumový rozsah nebo dny v týdnu, SHALL být tyto údaje součástí formátované podmínky.

#### Scenario: Activity-filtered bonus is rendered

- **WHEN** vybrané pravidlo obsahuje katalogové aktivity a podmínku počtu aktivit
- **THEN** zpráva zobrazí podmínku s názvy filtrovaných aktivit a výši bonusu

#### Scenario: Total-points bonus is rendered

- **WHEN** vybrané pravidlo používá podmínku celkových bodů bez katalogového filtru
- **THEN** zpráva zobrazí požadovaný celkový počet bodů, časové období a odměnu

### Requirement: Bonus announcements are idempotent and resilient

Systém SHALL zabránit opakovanému odeslání stejného bonusového pravidla prostřednictvím jedinečného záznamu v notifikačním logu. Selhání vložení logu SHALL zabránit odeslání dané zprávy; chyba Slacku nebo chybějící konfigurace SHALL nezpůsobit neřízené selhání cron endpointu.

#### Scenario: Rule has already been announced

- **WHEN** pro bonusové pravidlo již existuje záznam typu `bonus_start`
- **THEN** systém pravidlo přeskočí a Slack zprávu znovu neodešle

#### Scenario: Concurrent announcement attempt

- **WHEN** souběžný běh cron zpracuje stejné bonusové pravidlo
- **THEN** unikátní konflikt v notifikačním logu zabrání duplicitnímu odeslání

#### Scenario: Slack delivery fails

- **WHEN** Slack API vrátí chybu nebo chybí bot token
- **THEN** systém zaznamená selhání, pokračuje ve zpracování dalších pravidel a cron odpověď zůstane řízená

### Requirement: Bonus announcement cron is authenticated and scheduled for local morning

Cron endpoint SHALL vyžadovat platný `CRON_SECRET`. Automatické spuštění SHALL doručovat pouze v pražské hodině 09; deployment SHALL obsahovat UTC cron běhy `07:00` a `08:00`, aby bylo pokryto CET i CEST. Ruční trigger SHALL umožnit obejít časový gate pro provozní testování.

#### Scenario: Authorized request in Prague hour nine

- **WHEN** endpoint obdrží platný cron token a aktuální pražská hodina je 09
- **THEN** systém zpracuje bonusová oznámení a vrátí výsledek zpracování

#### Scenario: Automatic request outside the delivery hour

- **WHEN** endpoint obdrží platný token, není ručně spuštěn a pražská hodina není 09
- **THEN** systém vrátí řízenou odpověď se stavem přeskočení bez odesílání

#### Scenario: Unauthorized request

- **WHEN** endpoint obdrží chybějící nebo neplatný cron token
- **THEN** systém odpoví HTTP 401 a oznámení nezpracuje
