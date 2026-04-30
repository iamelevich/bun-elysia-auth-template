import { and, asc, count, desc, eq, like, type SQL } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { logDb } from "../db";
import { logs } from "../db/log.schema";
import { PageInfoSchema } from "../schemas/pagination";

export const logsRoutes = new Elysia({
  prefix: "/logs",
})
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 100;
      const offset = (page - 1) * limit;
      const sortBy = query.sortBy ?? "timestamp";
      const sortOrder = query.sortOrder ?? "desc";

      const conditions: SQL[] = [];
      if (query.level) {
        conditions.push(eq(logs.level, query.level));
      }
      if (query.category) {
        conditions.push(eq(logs.category, query.category));
      }
      if (query.message) {
        conditions.push(like(logs.message, `%${query.message}%`));
      }
      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const orderByColumn =
        sortBy === "timestamp"
          ? logs.timestamp
          : sortBy === "level"
            ? logs.level
            : sortBy === "message"
              ? logs.message
              : logs.id;
      const orderByFn = sortOrder === "asc" ? asc : desc;

      const [logEntries, totalResult] = await Promise.all([
        logDb
          .select()
          .from(logs)
          .where(whereClause)
          .orderBy(orderByFn(orderByColumn))
          .limit(limit)
          .offset(offset),
        logDb
          .select({ total: count(logs.id) })
          .from(logs)
          .where(whereClause)
          .get(),
      ]);

      const totalEntries = totalResult?.total ?? 0;

      return {
        pageInfo: {
          total: totalEntries,
          page,
          limit,
          hasNextPage: page * limit < totalEntries,
          hasPreviousPage: page > 1,
        },
        logs: logEntries,
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.Number({ default: 1 })),
        limit: t.Optional(t.Number({ default: 100 })),
        level: t.Optional(
          t.Union([
            t.Literal("debug"),
            t.Literal("info"),
            t.Literal("warn"),
            t.Literal("error"),
          ]),
        ),
        message: t.Optional(t.String()),
        category: t.Optional(t.String()),
        sortBy: t.Optional(
          t.Union([
            t.Literal("timestamp"),
            t.Literal("level"),
            t.Literal("message"),
            t.Literal("id"),
          ]),
        ),
        sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
      }),
      response: {
        200: t.Object({
          pageInfo: PageInfoSchema,
          logs: t.Array(
            t.Object({
              id: t.Number(),
              timestamp: t.Date(),
              level: t.String(),
              category: t.Nullable(t.String()),
              message: t.String(),
              data: t.Nullable(t.Any()),
            }),
          ),
        }),
      },
      detail: {
        summary: "Get all logs",
        description: "Return list of all logs",
        tags: ["Logs"],
      },
    },
  )
  .get(
    "/categories",
    async ({ status, query }) => {
      const categories = await logDb
        .selectDistinct({ category: logs.category })
        .from(logs)
        .where(query.query ? eq(logs.category, query.query) : undefined)
        .orderBy(logs.category);
      return status(
        200,
        categories.map((c) => c.category).filter((c) => typeof c === "string"),
      );
    },
    {
      query: t.Object({
        query: t.Optional(t.String()),
      }),
      response: {
        200: t.Array(t.String()),
      },
      detail: {
        summary: "Get all categories",
        description: "Return list of all categories",
        tags: ["Logs"],
      },
    },
  );
