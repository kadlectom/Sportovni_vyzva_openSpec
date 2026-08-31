jest.mock("@/lib/slack", () => ({
  sendSlackDM: jest.fn().mockResolvedValue({ ok: true }),
}))

var mockSelectWhere = jest.fn()
var mockSelect = jest.fn()
var mockInsertValues = jest.fn()

jest.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: () => ({ values: (...args: unknown[]) => mockInsertValues(...args) }),
  },
}))

import { notifyPartnerTagged } from "@/lib/notifications/partnerTagged"
import { sendSlackDM } from "@/lib/slack"

const actor = { name: "Honza" }
const activity = {
  value: 5,
  points: 10,
  catalogName: "Běh",
  catalogUnit: "km",
  partnerBonus: 2,
  challengeSlug: "zimni-vyzva",
}

function setupSelectMocks(recipient: { userId: string; slackId: string; notificationsEnabled: boolean }) {
  mockSelect.mockReset().mockImplementation(() => ({
    from: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: mockSelectWhere,
    }),
  }))
  mockSelectWhere
    .mockReset()
    .mockResolvedValueOnce([actor])
    .mockResolvedValueOnce([activity])
    .mockResolvedValueOnce([recipient])
}

describe("notifyPartnerTagged recipient preference", () => {
  beforeEach(() => {
    mockInsertValues.mockReset().mockResolvedValue(undefined)
    ;(sendSlackDM as jest.Mock).mockClear()
    process.env.NEXTAUTH_URL = "https://example.com"
  })

  it("sends and logs when the partner has notifications enabled", async () => {
    setupSelectMocks({ userId: "partner-1", slackId: "U123", notificationsEnabled: true })

    await notifyPartnerTagged({
      activityId: "activity-1",
      partnerUserIds: ["partner-1"],
      challengeId: "challenge-1",
      actorUserId: "actor-1",
    })

    expect(mockInsertValues).toHaveBeenCalledTimes(1)
    expect(sendSlackDM).toHaveBeenCalledWith("U123", expect.any(String))
  })

  it("skips without logging or sending when the partner opted out", async () => {
    setupSelectMocks({ userId: "partner-1", slackId: "U123", notificationsEnabled: false })

    await notifyPartnerTagged({
      activityId: "activity-1",
      partnerUserIds: ["partner-1"],
      challengeId: "challenge-1",
      actorUserId: "actor-1",
    })

    expect(mockInsertValues).not.toHaveBeenCalled()
    expect(sendSlackDM).not.toHaveBeenCalled()
  })
})
