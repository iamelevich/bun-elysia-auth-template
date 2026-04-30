import {
  DefaultErrorFunction,
  SetErrorFunction,
} from "@sinclair/typebox/errors";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { settings } from "./schema";

// Set error message for typebox from message property if it exists
SetErrorFunction((e) => {
  if (e.schema.message && typeof e.schema.message === "string") {
    return e.schema.message;
  }
  return DefaultErrorFunction(e);
});

// Settings models
export type SettingSelect = InferSelectModel<typeof settings>;
export type SettingInsert = InferInsertModel<typeof settings>;
export const SettingInsertSchema = createInsertSchema(settings);
export const SettingSelectSchema = createSelectSchema(settings);
