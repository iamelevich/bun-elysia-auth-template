import { asc, sql } from "drizzle-orm";
import Elysia, { NotFoundError, t } from "elysia";
import { db } from "../db";
import { SettingSelectSchema } from "../db/models";
import { settings } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { loggerService } from "../services/logger";

const ROUTE_PREFIX = "/settings";
const settingsLogger = loggerService.withCategory("settings");

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
  .use(authMiddleware)
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
      auth: true,
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
    async ({ body, user }) => {
      const keys = body.map((item) => item.key);
      const prevSettings = await db.query.settings.findMany({
        where: (s, { inArray }) => inArray(s.key, keys),
      });
      const prevValueMap = Object.fromEntries(
        prevSettings.map((s) => [s.key, s.value]),
      );

      const results = await db.transaction(async (tx) => {
        const updated = [];
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
          if (setting) updated.push(setting);
        }
        return updated;
      });

      await Promise.all(
        results.map((setting) =>
          settingsLogger.info(`Setting "${setting.key}" changed`, {
            key: setting.key,
            prevValue: prevValueMap[setting.key] ?? null,
            newValue: setting.value,
            changedBy: {
              userId: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          }),
        ),
      );

      return results;
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
      authAdmin: true,
    },
  )
  .patch(
    "/:key",
    async ({ params, body, user }) => {
      const prev = await db.query.settings.findFirst({
        where: (s, { eq }) => eq(s.key, params.key),
      });

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

      await settingsLogger.info(`Setting "${params.key}" changed`, {
        key: params.key,
        prevValue: prev?.value ?? null,
        newValue: body.value,
        changedBy: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });

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
      authAdmin: true,
    },
  );
