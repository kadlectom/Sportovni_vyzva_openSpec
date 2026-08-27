## Purpose

Umožňuje označenému partnerovi transparentně zjistit, kdo ho přidal k aktivitě, co bylo zaznamenáno a kolik bodů mu bylo připsáno prostřednictvím soukromé Slack zprávy.

## ADDED Requirements

### Requirement: Newly tagged partners receive a private activity notification

Systém SHALL po úspěšném přidání uživatele do partnerského seznamu aktivity odeslat tomuto uživateli soukromou Slack zprávu. Při editaci aktivity SHALL zprávu odeslat pouze nově přidaným partnerům; uživatelé, kteří již partnerem byli, ji při opětovném označení nedostanou znovu.

#### Scenario: Partner is added when an activity is created

- **WHEN** uživatel vytvoří aktivitu a přidá jednoho nebo více partnerů
- **THEN** každý nově přidaný partner obdrží soukromou Slack zprávu o označení

#### Scenario: New partner is added while editing an activity

- **WHEN** uživatel upraví aktivitu a přidá partnera, který u ní dosud nebyl uveden
- **THEN** nově přidaný partner obdrží právě jednu soukromou Slack zprávu

#### Scenario: Existing partner is retained or re-added

- **WHEN** uživatel upraví aktivitu a partner již u aktivity existoval
- **THEN** systém pro tohoto partnera novou Slack zprávu neodešle

### Requirement: Partner message contains activity and attribution details

Slack zpráva SHALL uvádět jméno uživatele, který partnera označil, název aktivity, zadanou hodnotu s jednotkou, celkový počet připsaných bodů včetně partnerského bonusu a odkaz na detail výzvy. Zpráva SHALL být adresována pouze příslušnému partnerovi.

#### Scenario: Message renders activity context

- **WHEN** systém načte platný kontext aktéra, aktivity, katalogu a výzvy
- **THEN** zpráva obsahuje atribuci aktéra, název a hodnotu aktivity, připsané body a odkaz na detail výzvy

#### Scenario: Partner bonus is included

- **WHEN** aktivita má nenulový partnerský bonus
- **THEN** částka ve zprávě zahrnuje základní body aktivity i partnerský bonus

### Requirement: Partner notification delivery is idempotent and fault tolerant

Systém SHALL zabránit duplicitnímu odeslání pro kombinaci aktivity a příjemce pomocí jedinečného záznamu notifikačního logu. Příjemce bez Slack ID nebo chybějící kontext SHALL být přeskočen; chyba Slack API SHALL nezpůsobit selhání hlavního zpracování aktivity.

#### Scenario: Same activity and recipient are processed twice

- **WHEN** se systém pokusí zpracovat stejné označení podruhé
- **THEN** unikátní log záznam zabrání druhému Slack odeslání

#### Scenario: Recipient has no Slack identifier

- **WHEN** nově přidaný partner nemá dostupné Slack ID
- **THEN** systém tohoto příjemce vynechá bez odeslání zprávy

#### Scenario: Slack delivery fails

- **WHEN** Slack API vrátí chybu nebo není dostupný token
- **THEN** chyba se zaznamená a hlavní API zpracování aktivity zůstane dokončeno
