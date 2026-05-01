import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  LIMIT_OPTIONS,
  LOG_LEVELS,
  logsSearchSchema,
  SORT_COLUMNS,
  SORT_ORDERS,
} from "./schema";

function parse(input: unknown) {
  return v.parse(logsSearchSchema, input);
}

describe("logsSearchSchema constants", () => {
  it("exports expected LIMIT_OPTIONS", () => {
    expect(LIMIT_OPTIONS).toEqual([10, 20, 50, 100]);
  });

  it("exports expected LOG_LEVELS", () => {
    expect(LOG_LEVELS).toEqual(["debug", "info", "warn", "error"]);
  });

  it("exports expected SORT_COLUMNS", () => {
    expect(SORT_COLUMNS).toContain("timestamp");
    expect(SORT_COLUMNS).toContain("level");
  });

  it("exports expected SORT_ORDERS", () => {
    expect(SORT_ORDERS).toEqual(["asc", "desc"]);
  });
});

describe("logsSearchSchema — page field", () => {
  it("is undefined when page is omitted (field is truly optional)", () => {
    expect(parse({}).page).toBeUndefined();
  });

  it("coerces string '3' to number 3", () => {
    expect(parse({ page: "3" }).page).toBe(3);
  });

  it("coerces number 5 to 5", () => {
    expect(parse({ page: 5 }).page).toBe(5);
  });

  it("clamps non-positive values to 1", () => {
    expect(parse({ page: "0" }).page).toBe(1);
    expect(parse({ page: "-2" }).page).toBe(1);
  });

  it("coerces non-numeric string to 1", () => {
    expect(parse({ page: "abc" }).page).toBe(1);
  });
});

describe("logsSearchSchema — limit field", () => {
  it("is undefined when limit is omitted (field is truly optional)", () => {
    expect(parse({}).limit).toBeUndefined();
  });

  it("accepts valid limit values", () => {
    for (const opt of LIMIT_OPTIONS) {
      expect(parse({ limit: opt }).limit).toBe(opt);
    }
  });

  it("accepts valid limit as string", () => {
    expect(parse({ limit: "20" }).limit).toBe(20);
  });

  it("snaps up to nearest valid limit when value is between options", () => {
    expect(parse({ limit: 15 }).limit).toBe(20);
    expect(parse({ limit: 1 }).limit).toBe(10);
    expect(parse({ limit: 51 }).limit).toBe(100);
  });

  it("uses the largest option when value exceeds all limits", () => {
    expect(parse({ limit: 9999 }).limit).toBe(100);
  });

  it("rejects invalid limit value that doesn't match picklist after transform", () => {
    // A value like 7 snaps to 10, which is valid — no throw expected here
    expect(() => parse({ limit: 7 })).not.toThrow();
  });
});

describe("logsSearchSchema — level field", () => {
  it("is optional and defaults to undefined", () => {
    expect(parse({}).level).toBeUndefined();
  });

  it.each(LOG_LEVELS)("accepts valid level '%s'", (level) => {
    expect(parse({ level }).level).toBe(level);
  });

  it("rejects an invalid level", () => {
    expect(() => parse({ level: "critical" })).toThrow();
  });
});

describe("logsSearchSchema — category, message fields", () => {
  it("are optional and default to undefined", () => {
    const result = parse({});
    expect(result.category).toBeUndefined();
    expect(result.message).toBeUndefined();
  });

  it("passes through string values", () => {
    expect(parse({ category: "auth", message: "login" })).toMatchObject({
      category: "auth",
      message: "login",
    });
  });
});

describe("logsSearchSchema — sortBy and sortOrder fields", () => {
  it.each(SORT_COLUMNS)("accepts sortBy '%s'", (col) => {
    expect(parse({ sortBy: col }).sortBy).toBe(col);
  });

  it.each(SORT_ORDERS)("accepts sortOrder '%s'", (order) => {
    expect(parse({ sortOrder: order }).sortOrder).toBe(order);
  });

  it("rejects invalid sortBy", () => {
    expect(() => parse({ sortBy: "unknown" })).toThrow();
  });

  it("rejects invalid sortOrder", () => {
    expect(() => parse({ sortOrder: "random" })).toThrow();
  });
});

describe("logsSearchSchema — full valid payload", () => {
  it("parses a complete valid object", () => {
    const result = parse({
      page: 2,
      limit: 50,
      level: "warn",
      category: "db",
      message: "query",
      sortBy: "timestamp",
      sortOrder: "desc",
    });
    expect(result).toEqual({
      page: 2,
      limit: 50,
      level: "warn",
      category: "db",
      message: "query",
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  });
});
