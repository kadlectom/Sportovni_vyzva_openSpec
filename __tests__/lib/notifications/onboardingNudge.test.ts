jest.mock("@/lib/slack", () => ({
  sendSlackDM: jest.fn().mockResolvedValue({ ok: true }),
}))

var mockCandidateWhere = jest.fn()
var mockActivityGroupBy = jest.fn()
var mockSentWhere = jest.fn()
var mockInsertValues = jest.fn()
var mockSelect = jest.fn()

jest.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: () => ({ values: (...args: unknown[]) => mockInsertValues(...args) }),
  },
}))

import { notifyOnboardingNudge } from "@/lib/notifications/onboardingNudge"
import { sendSlackDM } from "@/lib/slack"

const candidate = {
  userId: "user-1",
  slackId: "U123",
  challengeId: "challenge-1",
  challengeName: "Zimní výzva",
  challengeSlug: "zimni-vyzva",
  notificationsEnabled: true,
}

describe("notifyOnboardingNudge recipient preference", () => {
  beforeEach(() => {
    mockSelect.mockReset()
    mockSelect
      .mockImplementationOnce(() => ({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnThis(),
          where: mockCandidateWhere,
        }),
      }))
      .mockImplementationOnce(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ groupBy: mockActivityGroupBy }),
        }),
      }))
      .mockImplementationOnce(() => ({
        from: jest.fn().mockReturnValue({ where: mockSentWhere }),
      }))
    mockCandidateWhere.mockReset()
    mockActivityGroupBy.mockReset()
    mockSentWhere.mockReset()
    mockInsertValues.mockReset().mockResolvedValue(undefined)
    ;(sendSlackDM as jest.Mock).mockClear()
    process.env.NEXTAUTH_URL = "https://example.com"
  })

  it("sends and logs when the recipient has notifications enabled", async () => {
    mockCandidateWhere.mockResolvedValue([candidate])
    mockActivityGroupBy.mockResolvedValue([])
    mockSentWhere.mockResolvedValue([])

    const result = await notifyOnboardingNudge()

    expect(result.sent).toBe(1)
    expect(mockInsertValues).toHaveBeenCalledTimes(1)
    expect(sendSlackDM).toHaveBeenCalledWith("U123", expect.any(String))
  })

  it("skips without logging or sending when the recipient opted out", async () => {
    mockCandidateWhere.mockResolvedValue([{ ...candidate, notificationsEnabled: false }])
    mockActivityGroupBy.mockResolvedValue([])
    mockSentWhere.mockResolvedValue([])

    const result = await notifyOnboardingNudge()

    expect(result.skipped).toBe(1)
    expect(mockInsertValues).not.toHaveBeenCalled()
    expect(sendSlackDM).not.toHaveBeenCalled()
  })
})
