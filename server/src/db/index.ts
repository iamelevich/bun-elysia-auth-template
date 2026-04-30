import { drizzle } from "drizzle-orm/bun-sqlite";

import { env } from "../env";
import * as logSchema from "./log.schema";
import * as schema from "./schema";

export const db = drizzle({
  connection: { source: env.DB_FILE_NAME },
  schema,
});

export const logDb = drizzle({
  connection: { source: env.LOG_DB_FILE_NAME },
  schema: logSchema,
});
