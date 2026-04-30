import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { user as userTable } from "../db/auth-schema";
import { env } from "../env";
import { loggerService } from "../services/logger";

const authLogger = loggerService.withCategory("auth");

export const auth = betterAuth({
  basePath: "/api",
  trustedOrigins: [env.CLIENT_URL],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [openAPI()],
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          const userRecord = await db
            .select({ email: userTable.email })
            .from(userTable)
            .where(eq(userTable.id, session.userId))
            .get();
          const email = userRecord?.email ?? session.userId;
          await authLogger.info(`User ${email} signed in`, {
            session,
            userId: session.userId,
            email,
          });
        },
      },
      delete: {
        before: async (sessionData) => {
          const userRecord = await db
            .select({ email: userTable.email })
            .from(userTable)
            .where(eq(userTable.id, sessionData.userId))
            .get();
          const email = userRecord?.email ?? sessionData.userId;
          await authLogger.info(`User ${email} signed out`, {
            session: sessionData,
            userId: sessionData.userId,
            email,
          });
        },
      },
    },
  },
});
