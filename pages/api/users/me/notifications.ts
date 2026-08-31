import type { NextApiRequest, NextApiResponse } from "next"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { requireAuth } from "@/lib/permissions"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth({ req, res })
  if (!user) return

  if (req.method === "GET") {
    const record = await db
      .select({ notificationsEnabled: users.notificationsEnabled })
      .from(users)
      .where(eq(users.id, user.id))
      .get()

    if (!record) return res.status(404).json({ error: "Uživatel nenalezen" })
    return res.status(200).json(record)
  }

  if (req.method === "PATCH") {
    const { notificationsEnabled } = req.body ?? {}
    if (typeof notificationsEnabled !== "boolean") {
      return res.status(400).json({ error: "notificationsEnabled musí být boolean" })
    }

    const updated = await db
      .update(users)
      .set({ notificationsEnabled })
      .where(eq(users.id, user.id))
      .returning({ notificationsEnabled: users.notificationsEnabled })

    if (updated.length === 0) return res.status(404).json({ error: "Uživatel nenalezen" })
    return res.status(200).json(updated[0])
  }

  res.setHeader("Allow", ["GET", "PATCH"])
  return res.status(405).end()
}
