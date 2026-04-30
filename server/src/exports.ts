import type { app } from "./app";

export type App = typeof app;

export type { SettingInsert, SettingSelect } from "./db/models";
export { SettingInsertSchema, SettingSelectSchema } from "./db/models";

export type { PageInfo } from "./schemas/pagination";
