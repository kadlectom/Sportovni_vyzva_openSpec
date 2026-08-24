import type { WeeklyStats } from "@/lib/weeklyStats"

export type MondayTemplateId = "A" | "B" | "C" | "D"

const ROTATION_POOL: readonly MondayTemplateId[] = ["A", "B", "C"] as const

export function selectMondayTemplate(stats: WeeklyStats, weekIndex: number): MondayTemplateId {
  if (isEligible("D", stats)) return "D"

  const eligible = ROTATION_POOL.filter((id) => isEligible(id, stats))
  if (eligible.length === 0) return "A"
  return eligible[weekIndex % eligible.length]
}

export function isEligible(id: MondayTemplateId, stats: WeeklyStats): boolean {
  switch (id) {
    case "A": return stats.activityCount > 0
    case "B": return stats.varietyCount >= 4
    case "C": return stats.mostActiveDay !== null || stats.prevWeekActivityCount > 0
    case "D": return stats.nearestMilestone !== null
  }
}

export function renderMondayTemplate(id: MondayTemplateId, challengeName: string, stats: WeeklyStats): string {
  switch (id) {
    case "A": return renderA(challengeName, stats)
    case "B": return renderB(challengeName, stats)
    case "C": return renderC(challengeName, stats)
    case "D": return renderD(challengeName, stats)
  }
}

function renderA(name: string, s: WeeklyStats): string {
  const intro = `🏁 *Pondělní rozcvička*`
  return [
    intro,
    ``,
    `Tento týden ve výzvě _${name}_ se zatím daří takto:`,
    `• *${s.activityCount} ${pluralAktivita(s.activityCount)}* zaznamenáno · *+${fmt(s.totalKm)} km* k týmu`,
    s.topCatalogs.length > 0 ? `• Nejčastěji: ${formatTopCatalogs(s.topCatalogs)}` : null,
    `• Zapojilo se *${s.uniqueUserCount} ${pluralLide(s.uniqueUserCount)}*`,
    `• Celkem máme *${fmt(s.cumulativeKm)} km* · do konce zbývá *${s.daysRemaining} ${pluralDen(s.daysRemaining)}*.`,
    ``,
    `Hezký start do týdne! 💪`,
  ].filter(Boolean).join("\n")
}

function renderB(name: string, s: WeeklyStats): string {
  const firstTimers = s.firstTimers.length > 0
    ? `• Poprvé tu zaznělo: ${s.firstTimers.slice(0, 3).map((f) => `${f.catalogEmoji ?? "•"} *${f.catalogName}* (${f.userName})`).join(", ")}`
    : null

  return [
    `🌈 *Pondělní rozcvička — pestrý start*`,
    ``,
    `Tento týden ve výzvě _${name}_:`,
    `• *${s.varietyCount} různých aktivit* napříč týmem`,
    firstTimers,
    `• Celkem *+${fmt(s.totalKm)} km* od *${s.uniqueUserCount} ${pluralLide(s.uniqueUserCount)}*`,
    ``,
    `Přidejte své kroky a udržujte tenhle rytmus. 🚀`,
  ].filter(Boolean).join("\n")
}

function renderC(name: string, s: WeeklyStats): string {
  const day = s.mostActiveDay ? `• Nejaktivnější den: *${s.mostActiveDay.name}* (${s.mostActiveDay.count} ${pluralZapis(s.mostActiveDay.count)})` : null
  return [
    `📅 *Pondělní rozcvička — rytmus týdne*`,
    ``,
    `Tento týden ve výzvě _${name}_:`,
    day,
    s.topCatalogs[0] ? `• Hitem týdne je ${formatCatalog(s.topCatalogs[0])}` : null,
    `• *${s.activityCount} ${pluralAktivita(s.activityCount)}* a *+${fmt(s.totalKm)} km*`,
    ``,
    `Začněte od malého kroku a udržte tempo. 💪`,
  ].filter(Boolean).join("\n")
}

function renderD(name: string, s: WeeklyStats): string {
  const m = s.nearestMilestone!
  return [
    `🎯 *Pondělní rozcvička — do ${m.value} km zbývá ${fmt(m.remaining)} km*`,
    ``,
    `Tento týden ve výzvě _${name}_:`,
    `• Přidali jsme *+${fmt(s.totalKm)} km*`,
    `• Celkem už *${fmt(s.cumulativeKm)} km*`,
    `• Do milníku *${m.value} km* zbývá *${fmt(m.remaining)} km*`,
    ``,
    `Jeden dobrý víkend a hned to jde! 🚀`,
  ].filter(Boolean).join("\n")
}

function formatCatalog(c: { name: string; emoji: string | null; count: number }): string {
  const emoji = c.emoji ? `${c.emoji} ` : ""
  return `${emoji}*${c.name}* (${c.count}×)`
}

function formatTopCatalogs(top: { name: string; emoji: string | null; count: number }[]): string {
  return top.slice(0, 2).map(formatCatalog).join(" · ")
}

function fmt(n: number): string {
  if (Number.isInteger(n)) return n.toString()
  return n.toFixed(1).replace(/\.0$/, "")
}

function pluralForm(n: number, forms: [string, string, string]): string {
  if (n === 1) return forms[0]
  if (n >= 2 && n <= 4) return forms[1]
  return forms[2]
}

function pluralAktivita(n: number) { return pluralForm(n, ["aktivita", "aktivity", "aktivit"]) }
function pluralDen(n: number)      { return pluralForm(n, ["den", "dny", "dní"]) }
function pluralLide(n: number)     { return n === 1 ? "člověk" : "lidí" }
function pluralZapis(n: number)    { return pluralForm(n, ["zápis", "zápisy", "zápisů"]) }
