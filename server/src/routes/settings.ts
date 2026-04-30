import { asc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

import { db } from "../db";
import { SettingSelectSchema } from "../db/models";
import { settings } from "../db/schema";

const ROUTE_PREFIX = "/settings";

const updateSettingBody = t.Object({
  value: t.String({ minLength: 1, description: "The new value for the setting" }),
});

const batchUpdateSettingsBody = t.Array(
  t.Object({
    key: t.String({ minLength: 1 }),
    value: t.String({ minLength: 1 }),
  }),
);

export const settingsRoutes = new Elysia({ prefix: ROUTE_PREFIX })
  .get(
    "/",
    () => {
      return db.select().from(settings).orderBy(asc(settings.key));
    },
    {
      response: {
        200: t.Array(SettingSelectSchema),
      },
      detail: {
        summary: "Get list of settings",
        description: "Return all settings",
        tags: ["Settings"],
      },
    },
  )
  .get(
    "/:key",
    ({ params }) => {
      return db.query.settings.findFirst({
        where: (setting, { eq }) => eq(setting.key, params.key),
      });
    },
    {
      params: t.Object({
        key: t.String({ minLength: 1 }),
      }),
      detail: {
        summary: "Get setting by key",
        description: "Return a setting by its key",
        tags: ["Settings"],
      },
    },
  )
  .patch(
    "/batch",
    async ({ body }) => {
      return db.transaction(async (tx) => {
        const results = [];
        for (const { key, value } of body) {
          const [setting] = await tx
            .update(settings)
            .set({ value })
            .where(eq(settings.key, key))
            .returning();
          if (setting) results.push(setting);
        }
        return results;
      });
    },
    {
      body: batchUpdateSettingsBody,
      response: {
        200: t.Array(SettingSelectSchema),
      },
      detail: {
        summary: "Batch update settings",
        description:
          "Update multiple settings in a single transaction. Body is an array of key/value pairs.",
        tags: ["Settings"],
      },
    },
  )
  .patch(
    "/:key",
    async ({ params, body }) => {
      const [setting] = await db
        .update(settings)
        .set({ value: body.value })
        .where(eq(settings.key, params.key))
        .returning();
      return setting;
    },
    {
      params: t.Object({
        key: t.String({ minLength: 1 }),
      }),
      body: updateSettingBody,
      detail: {
        summary: "Update setting by key",
        description: "Update a setting's value by its key",
        tags: ["Settings"],
      },
    },
  );
