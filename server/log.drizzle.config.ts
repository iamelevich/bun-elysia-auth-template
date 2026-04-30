import type { Config } from "drizzle-kit";

import { env } from "./src/env";

const dbCredentials = {
  url: env.LOG_DB_FILE_NAME,
};

export default {
  dbCredentials,
  dialect: "sqlite",
  out: "./drizzle/log",
  breakpoints: true,
  schema: "./src/db/log.schema.ts",
} satisfies Config;
