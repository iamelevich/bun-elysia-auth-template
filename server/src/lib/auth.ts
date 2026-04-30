import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db";
import { env } from "../env";

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
});
