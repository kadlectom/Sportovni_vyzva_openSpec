import type { NextApiRequest, NextApiResponse } from "next"

jest.mock("@/lib/auth", () => ({ authOptions: {} }))
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }))

const mockSelectGet = jest.fn()
const mockUpdateReturning = jest.fn()
const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockUpdateReturning })
const mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere })

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ get: mockSelectGet }),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: mockUpdateSet,
    }),
  },
}))

function mockReq(method: string, body: Record<string, unknown> = {}): NextApiRequest {
  return { method, body } as unknown as NextApiRequest
}

function mockRes() {
  const res = {} as NextApiResponse
  const json = jest.fn().mockReturnValue(res)
  const end = jest.fn().mockReturnValue(res)
  const status = jest.fn().mockReturnValue({ json, end })
  const setHeader = jest.fn()
  return Object.assign(res, { status, json, end, setHeader })
}

describe("/api/users/me/notifications", () => {
  let handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>
  let getServerSession: jest.Mock

  beforeEach(async () => {
    jest.resetModules()
    const nextAuth = await import("next-auth")
    getServerSession = nextAuth.getServerSession as jest.Mock
    const mod = await import("@/pages/api/users/me/notifications")
    handler = mod.default

    getServerSession.mockReset().mockResolvedValue({ user: { id: "u1", role: "participant" } })
    mockSelectGet.mockReset()
    mockUpdateWhere.mockClear()
    mockUpdateSet.mockClear()
    mockUpdateReturning.mockReset()
  })

  it("returns 401 when unauthenticated", async () => {
    getServerSession.mockResolvedValue(null)
    const res = mockRes()

    await handler(mockReq("GET"), res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it("returns the current preference for the session user", async () => {
    mockSelectGet.mockResolvedValue({ notificationsEnabled: true })
    const res = mockRes()

    await handler(mockReq("GET"), res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ notificationsEnabled: true })
  })

  it("updates only the session user's preference", async () => {
    mockUpdateReturning.mockResolvedValue([{ notificationsEnabled: false }])
    const res = mockRes()

    await handler(mockReq("PATCH", { notificationsEnabled: false, userId: "other-user" }), res)

    expect(mockUpdateSet).toHaveBeenCalledWith({ notificationsEnabled: false })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ notificationsEnabled: false })
  })

  it("rejects a non-boolean preference", async () => {
    const res = mockRes()

    await handler(mockReq("PATCH", { notificationsEnabled: "false" }), res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockUpdateSet).not.toHaveBeenCalled()
  })
})
