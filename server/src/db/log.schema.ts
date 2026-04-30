import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const logLevels = ["debug", "info", "warn", "error"] as const;

export type LogLevel = (typeof logLevels)[number];

export const logs = sqliteTable("logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  timestamp: integer("timestamp", { mode: "timestamp_ms" })
    .default(sql`(strftime('%ms', 'now'))`)
    .notNull(),
  level: text("level", { enum: logLevels }).notNull(),
  category: text("category"),
  message: text("message").notNull(),
  data: text("data", { mode: "json" }),
});
