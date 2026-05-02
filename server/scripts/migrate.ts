import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import config from "../drizzle.config";
import logConfig from "../log.drizzle.config";
import { db, logDb } from "../src/db";

try {
  migrate(db, {
    migrationsFolder: process.env.DB_MIGRATIONS_FOLDER || config.out,
  });
  console.log("Migration main database successful");
  migrate(logDb, {
    migrationsFolder: process.env.LOG_MIGRATIONS_FOLDER || logConfig.out,
  });
  console.log("Migration log database successful");
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
