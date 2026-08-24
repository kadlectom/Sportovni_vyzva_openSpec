import { selectMondayTemplate, renderMondayTemplate } from "@/lib/notifications/mondayTemplate"
import type { WeeklyStats } from "@/lib/weeklyStats"

function baseStats(overrides: Partial<WeeklyStats> = {}): WeeklyStats {
  return {
    activityCount:         12,
    totalKm:               80,
    uniqueUserCount:       8,
    topCatalogs:           [{ name: "běh", emoji: "🏃", count: 6 }, { name: "plavání", emoji: "🏊", count: 4 }],
    varietyCount:          5,
    firstTimers:           [],
    prevWeekActivityCount: 10,
    prevWeekTotalKm:       72,
    cumulativeKm:          1400,
    daysRemaining:         18,
    nearestMilestone:      null,
    bonusesEarned:         [],
    mostActiveDay:         { name: "úterý", count: 5 },
    ...overrides,
  }
}

describe("selectMondayTemplate", () => {
  it("defaults to A when no special condition is active", () => {
    expect(selectMondayTemplate(baseStats(), 0)).toBe("A")
  })

  it("prefers milestone messaging when a milestone is close", () => {
    const stats = baseStats({
      nearestMilestone: { value: 1500, remaining: 47, justCrossed: false },
    })
    expect(selectMondayTemplate(stats, 0)).toBe("D")
  })
})

describe("renderMondayTemplate", () => {
  it("renders a Monday warm-up summary with the project naming", () => {
    const out = renderMondayTemplate("A", "Zimní 2026", baseStats())
    expect(out).toContain("Pondělní rozcvička")
    expect(out).toContain("Zimní 2026")
    expect(out).toContain("12 aktivit")
    expect(out).toContain("80 km")
  })

  it("uses milestone wording when milestone mode is selected", () => {
    const out = renderMondayTemplate("D", "Zimní 2026", baseStats({
      nearestMilestone: { value: 1500, remaining: 47, justCrossed: false },
    }))
    expect(out).toContain("do 1500 km")
  })
})
