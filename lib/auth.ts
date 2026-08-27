import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import SlackProvider from "next-auth/providers/slack"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export const authOptions: NextAuthOptions = {
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            id: "dev-login",
            name: "Development login",
            credentials: {
              role: { label: "Role", type: "text" },
            },
            async authorize(credentials) {
              if (process.env.NODE_ENV !== "development") return null

              const role = credentials?.role
              if (role !== "admin" && role !== "participant") return null

              const slackId = `dev-${role}`
              const existing = await db
                .select()
                .from(users)
                .where(eq(users.slackId, slackId))
                .get()

              const devUser = existing ?? (await db.insert(users).values({
                id: crypto.randomUUID(),
                slackId,
                name: role === "admin" ? "Dev Admin" : "Dev Participant",
                email: `${slackId}@localhost`,
                avatarUrl: null,
                role,
                createdAt: new Date(),
              }).returning().get())

              return {
                id: devUser.id,
                name: devUser.name,
                email: devUser.email,
                image: devUser.avatarUrl,
              }
            },
          }),
        ]
      : []),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    // ── Sign-in ──────────────────────────────────────────────────────────────
    async signIn({ user, account }) {
      if (account?.provider === "dev-login") return true
      if (account?.provider !== "slack") return false

      // Restrict to a single workspace if SLACK_TEAM_ID is set
      const allowedTeam = process.env.SLACK_TEAM_ID
      if (allowedTeam && account.team_id && account.team_id !== allowedTeam) {
        return false
      }

      const slackId = account.providerAccountId

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.slackId, slackId))
        .get()

      if (!existing) {
        // Assign admin role if Slack ID is in the bootstrap whitelist.
        // This only runs once — on first login. After that, role lives in DB only.
        const adminIds = (process.env.ADMIN_SLACK_IDS ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)

        const role = adminIds.includes(slackId) ? "admin" : "participant"

        await db.insert(users).values({
          id:        crypto.randomUUID(),
          slackId,
          name:      user.name ?? "Neznámý uživatel",
          email:     user.email ?? null,
          avatarUrl: user.image ?? null,
          role,
          createdAt: new Date(),
        })
      }

      return true
    },

    // ── JWT ───────────────────────────────────────────────────────────────────
    // Store slackId in token on first sign-in, then always refresh userId + role
    // from DB so role changes take effect on the next request.
    async jwt({ token, account }) {
      if (account) {
        if (account.provider === "slack") {
          token.slackId = account.providerAccountId
        } else if (account.provider === "dev-login") {
          token.userId = account.providerAccountId
        }
      }

      const dbUser = token.slackId
        ? await db
            .select({ id: users.id, role: users.role })
            .from(users)
            .where(eq(users.slackId, token.slackId as string))
            .get()
        : token.userId
          ? await db
              .select({ id: users.id, role: users.role })
              .from(users)
              .where(eq(users.id, token.userId as string))
              .get()
          : undefined

      if (dbUser) {
        token.userId = dbUser.id
        token.role   = dbUser.role
      }

      return token
    },

    // ── Session ───────────────────────────────────────────────────────────────
    async session({ session, token }) {
      session.user.id   = token.userId as string
      session.user.role = token.role as string
      return session
    },
  },
}
