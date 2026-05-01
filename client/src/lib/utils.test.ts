import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("omits falsy values", () => {
    expect(cn("foo", false, null, undefined, 0 as never, "bar")).toBe(
      "foo bar",
    );
  });

  it("supports conditional object syntax from clsx", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("resolves tailwind conflicts — last value wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("merges conditional tailwind classes correctly", () => {
    const active = true;
    expect(cn("px-2 py-1", active && "bg-blue-500")).toBe(
      "px-2 py-1 bg-blue-500",
    );
  });

  it("returns empty string when no truthy inputs are provided", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined)).toBe("");
  });
});
