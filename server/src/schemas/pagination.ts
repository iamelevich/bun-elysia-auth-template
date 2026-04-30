import { type Static, t } from "elysia";

export const PageInfoSchema = t.Object({
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
  hasNextPage: t.Boolean(),
  hasPreviousPage: t.Boolean(),
});

export type PageInfo = Static<typeof PageInfoSchema>;
