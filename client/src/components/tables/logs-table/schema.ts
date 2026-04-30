import * as v from "valibot";

export const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
export const SORT_COLUMNS = ["timestamp", "level", "message", "id"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const logsSearchSchema = v.object({
  page: v.pipe(
    v.optional(v.union([v.string(), v.number()])),
    v.transform((input) => {
      const rawPage = Number(input) || 1;
      return Math.max(1, rawPage);
    }),
    v.minValue(1),
  ),
  limit: v.pipe(
    v.optional(v.union([v.string(), v.number()])),
    v.transform((input) => {
      const rawLimit = Number(input) || 10;
      return LIMIT_OPTIONS.includes(rawLimit as (typeof LIMIT_OPTIONS)[number])
        ? rawLimit
        : (LIMIT_OPTIONS.find((opt) => opt >= rawLimit) ??
            LIMIT_OPTIONS[LIMIT_OPTIONS.length - 1]);
    }),
    v.picklist(LIMIT_OPTIONS),
  ),
  level: v.optional(v.picklist(LOG_LEVELS)),
  category: v.optional(v.string()),
  message: v.optional(v.string()),
  sortBy: v.optional(v.picklist(SORT_COLUMNS)),
  sortOrder: v.optional(v.picklist(SORT_ORDERS)),
});

export type LogsSearch = v.InferOutput<typeof logsSearchSchema>;
export type LogsSearchLimit = LogsSearch["limit"];
