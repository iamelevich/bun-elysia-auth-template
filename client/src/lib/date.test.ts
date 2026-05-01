import { describe, expect, it } from "vitest";
import {
  formatToLocaleDateString,
  formatToLocaleString,
  timestampToDate,
} from "./date";

describe("timestampToDate", () => {
  it("converts a unix timestamp (seconds) to a Date", () => {
    const ts = 1_000_000;
    const date = timestampToDate(ts);
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toBe(ts * 1000);
  });

  it("handles zero", () => {
    expect(timestampToDate(0).getTime()).toBe(0);
  });
});

describe("formatToLocaleString", () => {
  const fixedDate = new Date("2024-06-15T12:00:00.000Z");

  it("accepts a Date object", () => {
    const result = formatToLocaleString(fixedDate);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("accepts an ISO string", () => {
    const result = formatToLocaleString("2024-06-15T12:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("accepts a unix timestamp number", () => {
    const ts = Math.floor(fixedDate.getTime() / 1000);
    const result = formatToLocaleString(ts);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("produces the same output for a Date and its ISO string equivalent", () => {
    const isoString = fixedDate.toISOString();
    expect(formatToLocaleString(fixedDate)).toBe(
      formatToLocaleString(isoString),
    );
  });
});

describe("formatToLocaleDateString", () => {
  const fixedDate = new Date("2024-06-15T12:00:00.000Z");

  it("accepts a Date object", () => {
    const result = formatToLocaleDateString(fixedDate);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("accepts an ISO string", () => {
    const result = formatToLocaleDateString("2024-06-15T12:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("accepts a unix timestamp number", () => {
    const ts = Math.floor(fixedDate.getTime() / 1000);
    const result = formatToLocaleDateString(ts);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("date-only string is shorter than or equal to full locale string", () => {
    const date = formatToLocaleDateString(fixedDate);
    const full = formatToLocaleString(fixedDate);
    expect(date.length).toBeLessThanOrEqual(full.length);
  });
});
