import { asc, sql } from "drizzle-orm";
import Elysia, { NotFoundError, t } from "elysia";
import { db } from "../db";
import { SettingSelectSchema } from "../db/models";
import { settings } from "../db/schema";

const ROUTE_PREFIX = "/settings";

const updateSettingBody = t.Object({
  value: t.String({
    minLength: 1,
    description: "The new value for the setting",
  }),
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
    async ({ params }) => {
      const setting = await db.query.settings.findFirst({
        where: (setting, { eq }) => eq(setting.key, params.key),
      });
      if (!setting) throw new NotFoundError("Setting not found");
      return setting;
    },
    {
      params: t.Object({
        key: t.String({ minLength: 1 }),
      }),
      response: {
        200: SettingSelectSchema,
        404: t.Literal("Setting not found"),
      },
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
            .insert(settings)
            .values({
              key,
              value,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: settings.key,
              set: { value, updatedAt: sql`strftime('%s', 'now')` },
            })
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
        .insert(settings)
        .values({
          key: params.key,
          value: body.value,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: body.value, updatedAt: sql`strftime('%s', 'now')` },
        })
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
