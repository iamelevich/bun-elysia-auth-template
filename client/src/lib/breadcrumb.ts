import type { AnyRouteMatch } from "@tanstack/react-router";

/**
 * A single breadcrumb entry: either a label string or an object with label and optional href.
 * When href is omitted, the segment is rendered as current page (no link).
 */
export type BreadcrumbEntry = string | { label: string; href?: string };

/**
 * Route staticData.breadcrumb: static value or a function that receives the route match
 * (e.g. for dynamic segments like $id) and returns a BreadcrumbEntry.
 */
export type BreadcrumbStaticData =
  | BreadcrumbEntry
  | ((match: AnyRouteMatch) => BreadcrumbEntry);

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbStaticData;
  }
}

/**
 * Resolves staticData.breadcrumb from a match to a normalized { label, href }.
 */
export function resolveBreadcrumb(
  match: AnyRouteMatch,
  defaultHref: string,
): { label: string; href: string | undefined } {
  const raw = (
    match.staticData as { breadcrumb?: BreadcrumbStaticData } | undefined
  )?.breadcrumb;
  if (raw === undefined) {
    return { label: "", href: undefined };
  }
  const entry: BreadcrumbEntry = typeof raw === "function" ? raw(match) : raw;
  if (typeof entry === "string") {
    return { label: entry, href: defaultHref };
  }
  return {
    label: entry.label,
    href: entry.href !== undefined ? entry.href : defaultHref,
  };
}
