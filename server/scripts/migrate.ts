import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import config from "../drizzle.config";
import { db, logDb } from "../src/db";
import logConfig from "../log.drizzle.config";

try {
  migrate(db, { migrationsFolder: config.out });
  console.log("Migration main database successful");
  migrate(logDb, { migrationsFolder: logConfig.out });
  console.log("Migration log database successful");
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
