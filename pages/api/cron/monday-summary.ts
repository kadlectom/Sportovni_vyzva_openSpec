import type { NextApiRequest, NextApiResponse } from "next"
import { assertCronAuth } from "@/lib/cronAuth"
import { notifyMondaySummary } from "@/lib/notifications/mondaySummary"
import { isPragueHour } from "@/lib/pragueTime"

// Monday warm-up summary into the shared challenge channel.
// Schedule in vercel.json: Monday entries around 08:30 Prague local time.
// Trigger manually with:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        -H "X-Manual-Trigger: 1" \
//        https://<host>/api/cron/monday-summary
const PRAGUE_HOUR = 8

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!assertCronAuth(req, res)) return

  const manualTrigger = req.headers["x-manual-trigger"] === "1"
  if (!manualTrigger && !isPragueHour(PRAGUE_HOUR)) {
    return res.status(200).json({ ok: true, skipped: "outside_prague_window" })
  }

  const result = await notifyMondaySummary()
  res.status(200).json({ ok: true, ...result })
}
