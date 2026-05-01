import { describe, expect, it } from "bun:test";
import { getSlug } from "./utils";

describe("getSlug", () => {
  it("lowercases all characters", () => {
    expect(getSlug("HELLO")).toBe("hello");
  });

  it("replaces a single space with a dash", () => {
    expect(getSlug("hello world")).toBe("hello-world");
  });

  it("collapses multiple consecutive spaces into one dash", () => {
    expect(getSlug("foo  bar")).toBe("foo-bar");
    expect(getSlug("foo   bar")).toBe("foo-bar");
  });

  it("handles tabs and newlines as whitespace", () => {
    expect(getSlug("foo\tbar")).toBe("foo-bar");
    expect(getSlug("foo\nbar")).toBe("foo-bar");
  });

  it("preserves existing dashes", () => {
    expect(getSlug("already-slugified")).toBe("already-slugified");
  });

  it("handles mixed case with numbers", () => {
    expect(getSlug("Test 123")).toBe("test-123");
  });

  it("returns empty string for empty input", () => {
    expect(getSlug("")).toBe("");
  });

  it("converts a single word to lowercase", () => {
    expect(getSlug("Word")).toBe("word");
  });
});
