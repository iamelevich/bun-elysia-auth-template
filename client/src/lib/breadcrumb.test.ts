import type { AnyRouteMatch } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { resolveBreadcrumb } from "./breadcrumb";

function makeMatch(breadcrumb: unknown): AnyRouteMatch {
  return {
    staticData: breadcrumb !== undefined ? { breadcrumb } : {},
  } as unknown as AnyRouteMatch;
}

describe("resolveBreadcrumb", () => {
  it("returns empty label and undefined href when no breadcrumb is set", () => {
    const match = makeMatch(undefined);
    expect(resolveBreadcrumb(match, "/home")).toEqual({
      label: "",
      href: undefined,
    });
  });

  it("returns label and defaultHref when breadcrumb is a string", () => {
    const match = makeMatch("Dashboard");
    expect(resolveBreadcrumb(match, "/dashboard")).toEqual({
      label: "Dashboard",
      href: "/dashboard",
    });
  });

  it("returns label and explicit href when breadcrumb is an object with href", () => {
    const match = makeMatch({ label: "Users", href: "/admin/users" });
    expect(resolveBreadcrumb(match, "/fallback")).toEqual({
      label: "Users",
      href: "/admin/users",
    });
  });

  it("falls back to defaultHref when breadcrumb object omits href", () => {
    const match = makeMatch({ label: "Settings" });
    expect(resolveBreadcrumb(match, "/settings")).toEqual({
      label: "Settings",
      href: "/settings",
    });
  });

  it("resolves a function breadcrumb by calling it with the match", () => {
    const fn = (m: AnyRouteMatch) => ({
      label: `Item ${(m as unknown as { params: { id: string } }).params.id}`,
    });
    const match = {
      staticData: { breadcrumb: fn },
      params: { id: "42" },
    } as unknown as AnyRouteMatch;
    expect(resolveBreadcrumb(match, "/items/42")).toEqual({
      label: "Item 42",
      href: "/items/42",
    });
  });

  it("resolves a function breadcrumb that returns a plain string", () => {
    const fn = () => "Home";
    const match = makeMatch(fn);
    expect(resolveBreadcrumb(match, "/")).toEqual({
      label: "Home",
      href: "/",
    });
  });
});
