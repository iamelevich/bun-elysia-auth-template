import { Link, useMatches } from "@tanstack/react-router";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { resolveBreadcrumb } from "@/lib/breadcrumb";

/**
 * Renders breadcrumbs from the current route tree. Each route can define
 * `staticData.breadcrumb` (string, { label, href? }, or (match) => BreadcrumbEntry).
 * Root route is skipped. The last segment is rendered as current page (no link).
 */
export function AppBreadcrumbs() {
  const matches = useMatches();

  const items = matches
    .map((match) => {
      const { label, href } = resolveBreadcrumb(match, match.pathname ?? "");
      return { routeId: match.routeId, label, href };
    })
    .filter((item) => item.label !== "");

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.routeId}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem
                className={index === 0 ? "hidden md:block" : undefined}
              >
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink render={<Link to={item.href} />}>
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
