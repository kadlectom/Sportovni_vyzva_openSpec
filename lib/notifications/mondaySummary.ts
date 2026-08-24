import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { challenges, notificationLog } from "@/db/schema"
import { sendSlackChannel } from "@/lib/slack"
import { getWeeklyStats, shiftIso } from "@/lib/weeklyStats"
import { currentIsoWeek, isoWeekParts } from "@/lib/isoWeek"
import { selectMondayTemplate, renderMondayTemplate } from "@/lib/notifications/mondayTemplate"

const NOTIFICATION_TYPE = "monday_summary"
const WINDOW_DAYS = 7

type MondaySummaryResult = {
  attempted: number
  sent: number
  skipped: number
  failed: number
  reason?: string
}

export async function notifyMondaySummary(): Promise<MondaySummaryResult> {
  const result: MondaySummaryResult = { attempted: 0, sent: 0, skipped: 0, failed: 0 }

  const channelId = process.env.SLACK_CHANNEL_ID
  if (!channelId) {
    console.warn("[notify:mondaySummary] SLACK_CHANNEL_ID not configured — skipping")
    result.reason = "no_channel"
    return result
  }

  try {
    const activeChallenges = await db
      .select({ id: challenges.id, name: challenges.name, startDate: challenges.startDate, endDate: challenges.endDate, slug: challenges.slug })
      .from(challenges)
      .where(eq(challenges.status, "ACTIVE"))

    if (activeChallenges.length === 0) {
      result.reason = "no_active_challenge"
      return result
    }

    const now = new Date()
    const todayIso = now.toISOString().slice(0, 10)
    const isoWeek = currentIsoWeek(now)
    const [, weekNumber] = isoWeekParts(now)

    for (const ch of activeChallenges) {
      result.attempted += 1

      const naturalFromIso = shiftIso(todayIso, -(WINDOW_DAYS - 1))
      const fromIso = naturalFromIso < ch.startDate ? ch.startDate : naturalFromIso
      const toIso = todayIso

      const stats = await getWeeklyStats({
        challengeId: ch.id,
        startDateIso: ch.startDate,
        endDateIso: ch.endDate,
        fromIso,
        toIso,
        todayIso,
      })

      if (stats.activityCount === 0) {
        result.skipped += 1
        continue
      }

      const templateId = selectMondayTemplate(stats, weekNumber)
      const message = renderMondayTemplate(templateId, ch.name, stats)
      const refId = `${ch.id}:${isoWeek}`

      try {
        await db.insert(notificationLog).values({
          id: crypto.randomUUID(),
          type: NOTIFICATION_TYPE,
          refId,
          userId: null,
          sentAt: new Date(),
        })
      } catch {
        result.skipped += 1
        continue
      }

      const slack = await sendSlackChannel(channelId, message)
      if (slack.ok) {
        result.sent += 1
      } else {
        result.failed += 1
        console.warn("[notify:mondaySummary] slack failed", { challengeId: ch.id, templateId, error: slack.error })
      }
    }
  } catch (err) {
    console.error("[notify:mondaySummary] unexpected", err)
  }

  return result
}
