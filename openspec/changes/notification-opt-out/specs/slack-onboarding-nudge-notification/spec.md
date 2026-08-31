## ADDED Requirements

### Requirement: Notification respects recipient's opt-out preference

Před odesláním onboardingového DM SHALL systém načíst `notificationsEnabled` příjemce. Pokud je hodnota `true`, SHALL zachovat běžné odeslání a idempotentní zápis do `notification_log`; pokud je hodnota `false`, SHALL příjemce čistě přeskočit bez odeslání Slack DM a bez zápisu do `notification_log`. Preference aktéra ani jiného uživatele SHALL toto rozhodnutí neovlivnit.

#### Scenario: Recipient has notifications enabled

- **WHEN** způsobilý příjemce onboardingového DM má `notificationsEnabled = true`
- **THEN** systém odešle jeho DM a zapíše příslušný idempotentní záznam do `notification_log`

#### Scenario: Recipient has opted out

- **WHEN** způsobilý příjemce onboardingového DM má `notificationsEnabled = false`
- **THEN** systém DM neodešle, nezapíše `notification_log` záznam a kandidáta čistě přeskočí
