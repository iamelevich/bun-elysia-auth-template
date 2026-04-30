import type { Config } from "drizzle-kit";

import { env } from "./src/env";

const dbCredentials = {
  url: env.DB_FILE_NAME,
};

export default {
  dbCredentials,
  dialect: "sqlite",
  out: "./drizzle",
  breakpoints: true,
  schema: "./src/db/schema.ts",
} satisfies Config;
