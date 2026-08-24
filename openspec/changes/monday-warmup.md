# Pondělní rozcvička (TIER 1)

## Summary
Add a Monday warm-up Slack channel notification for active challenges using the existing weekly stats foundation. The goal is to provide a lightweight, motivating recap that helps the team restart the week without heavy ranking pressure.

## Scope
- Add a Monday cron route at `/api/cron/monday-summary`
- Create a dedicated template selection and rendering layer for Monday messaging
- Reuse `getWeeklyStats` and existing Slack helpers for channel delivery
- Keep the notification idempotent per challenge + ISO week via `notification_log`
- Register the cron in `vercel.json`

## Acceptance criteria
- Monday cron fires around 08:30 Prague time
- The message is sent only for active challenges with activity in the last 7 days
- A milestone template wins when the challenge is close to a key threshold
- The default template includes the weekly stats summary and team totals
- The implementation is covered by unit tests
